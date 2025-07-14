import { Request, Response } from 'express';
import { db, upload } from '../../server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import unzipper from 'unzipper';

const execAsync = promisify(exec);

export async function getAllVideos(req: Request, res: Response) {
  try {
    const videosSnapshot = await db.collection('videos').get();
    
    const videos = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      videos
    });
  } catch (error: any) {
    console.error('Error getting videos:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getVideoPreview(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    
    const videoDoc = await db.collection('videos').doc(videoId).get();
    
    if (!videoDoc.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoDoc.data()!;
    const previewPath = path.join(__dirname, '../../../public/previews', video.previewUrl?.split('/').pop() || `${videoId}.mp4`);

    if (!fs.existsSync(previewPath)) {
      return res.status(404).json({ error: 'Preview not found' });
    }

    // Stream the preview video
    const stat = fs.statSync(previewPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(previewPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(previewPath).pipe(res);
    }
  } catch (error: any) {
    console.error('Error serving preview:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function uploadVideo(req: Request, res: Response) {
  try {
    upload.single('video')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { title, description, category, price, userId } = req.body;
      const videoFile = req.file;
      const thumbnailFile = req.files?.thumbnail?.[0];

      if (!videoFile) {
        return res.status(400).json({ error: 'Video file is required' });
      }

      const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const videoPath = videoFile.path;
      const vaultPath = path.join(__dirname, '../../../vault', `${videoId}.mp4`);
      const previewPath = path.join(__dirname, '../../../public/previews', `${videoId}.mp4`);
      const thumbnailPath = thumbnailFile 
        ? path.join(__dirname, '../../../public/thumbnails', `${videoId}.jpg`)
        : path.join(__dirname, '../../../public/thumbnails', `${videoId}.jpg`);

      // Create directories if they don't exist
      fs.mkdirSync(path.dirname(vaultPath), { recursive: true });
      fs.mkdirSync(path.dirname(previewPath), { recursive: true });
      fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true });

      // Compress video and move to vault
      await execAsync(`ffmpeg -i "${videoPath}" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "${vaultPath}"`);

      // Generate 40s preview
      await execAsync(`ffmpeg -i "${videoPath}" -t 40 -c:v libx264 -crf 23 -preset fast -c:a aac -b:a 128k "${previewPath}"`);

      // Generate thumbnail if not provided
      if (!thumbnailFile) {
        await execAsync(`ffmpeg -i "${videoPath}" -ss 00:00:05 -vframes 1 -vf "scale=1280:720" "${thumbnailPath}"`);
      } else {
        fs.copyFileSync(thumbnailFile.path, thumbnailPath);
      }

      // Create ZIP file for download
      const zipPath = path.join(__dirname, '../../../vault', `${videoId}.zip`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.pipe(output);
      archive.file(vaultPath, { name: 'video.mp4' });
      await archive.finalize();

      // Save to Firestore
      const videoRef = db.collection('videos').doc(videoId);
      await videoRef.set({
        id: videoId,
        title,
        description,
        category,
        price: parseFloat(price),
        creatorId: userId,
        previewUrl: `/previews/${videoId}.mp4`,
        thumbnailUrl: `/thumbnails/${videoId}.jpg`,
        vaultPath: `${videoId}.mp4`,
        zipPath: `${videoId}.zip`,
        duration: 0, // Will be updated after processing
        views: 0,
        purchases: 0,
        previewClicks: 0,
        createdAt: new Date(),
        status: 'processing'
      });

      // Clean up uploaded file
      fs.unlinkSync(videoPath);
      if (thumbnailFile) {
        fs.unlinkSync(thumbnailFile.path);
      }

      res.json({ 
        success: true, 
        videoId,
        message: 'Video uploaded and processed successfully' 
      });
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getVideo(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    const videoDoc = await db.collection('videos').doc(videoId).get();
    
    if (!videoDoc.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoDoc.data();
    res.json({ success: true, video });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function downloadVideo(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    const { userId } = req.body;

    // Check if user has purchased the video
    const purchaseDoc = await db
      .collection('users')
      .doc(userId)
      .collection('purchases')
      .doc(videoId)
      .get();

    if (!purchaseDoc.exists) {
      return res.status(403).json({ error: 'Video not purchased' });
    }

    const videoDoc = await db.collection('videos').doc(videoId).get();
    if (!videoDoc.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoDoc.data();
    const zipPath = path.join(__dirname, '../../../vault', video.zipPath);

    if (!fs.existsSync(zipPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    // Download to user's library
    const userLibraryPath = path.join(__dirname, '../../../library', userId);
    if (!fs.existsSync(userLibraryPath)) {
      fs.mkdirSync(userLibraryPath, { recursive: true });
    }

    const extractPath = path.join(userLibraryPath, videoId);
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .on('close', () => {
        console.log(`Video ${videoId} extracted to ${extractPath}`);
      });

    res.json({ 
      success: true, 
      message: 'Video downloaded to library',
      localPath: extractPath
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getVaultStats(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    const videosSnapshot = await db
      .collection('videos')
      .where('creatorId', '==', userId)
      .get();

    const videos = videosSnapshot.docs.map(doc => doc.data());
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const totalPurchases = videos.reduce((sum, video) => sum + video.purchases, 0);
    const totalRevenue = videos.reduce((sum, video) => sum + (video.price * video.purchases), 0);

    res.json({
      success: true,
      stats: {
        totalVideos: videos.length,
        totalViews,
        totalPurchases,
        totalRevenue,
        averageRating: videos.length > 0 ? videos.reduce((sum, video) => sum + (video.rating || 0), 0) / videos.length : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}