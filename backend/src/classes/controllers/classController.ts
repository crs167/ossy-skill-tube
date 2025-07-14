import { Request, Response } from 'express';
import { db } from '../../server';
import { LiveKitClient } from 'livekit-server-sdk';

const livekit = new LiveKitClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function getCreatorDashboard(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    // Get user's videos
    const videosSnapshot = await db
      .collection('videos')
      .where('creatorId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const videos = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate analytics
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const totalPurchases = videos.reduce((sum, video) => sum + video.purchases, 0);
    const totalRevenue = videos.reduce((sum, video) => sum + (video.price * video.purchases), 0);
    const averageRating = videos.length > 0 
      ? videos.reduce((sum, video) => sum + (video.rating || 0), 0) / videos.length 
      : 0;

    // Get live class bookings
    const bookingsSnapshot = await db
      .collection('liveClasses')
      .where('creatorId', '==', userId)
      .where('status', '==', 'scheduled')
      .get();

    const upcomingClasses = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Check if creator can host live classes (rating + video threshold)
    const canHostLive = averageRating >= 4.0 && videos.length >= 3;

    res.json({
      success: true,
      dashboard: {
        videos,
        analytics: {
          totalVideos: videos.length,
          totalViews,
          totalPurchases,
          totalRevenue,
          averageRating,
          canHostLive
        },
        upcomingClasses,
        recentActivity: await getRecentActivity(userId)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getVideoAnalytics(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    
    const videoDoc = await db.collection('videos').doc(videoId).get();
    
    if (!videoDoc.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoDoc.data()!;
    
    // Get purchase history
    const purchasesSnapshot = await db
      .collection('transactions')
      .where('videoId', '==', videoId)
      .where('status', '==', 'paid')
      .orderBy('completedAt', 'desc')
      .limit(10)
      .get();

    const recentPurchases = purchasesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate conversion rate
    const conversionRate = video.views > 0 ? (video.purchases / video.views) * 100 : 0;

    res.json({
      success: true,
      analytics: {
        video,
        recentPurchases,
        conversionRate,
        revenue: video.price * video.purchases,
        averageWatchTime: video.averageWatchTime || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createLiveClass(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { title, description, date, duration, price, maxParticipants } = req.body;

    // Check if creator can host live classes
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();
    
    if (user?.role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can host live classes' });
    }

    // Create LiveKit room
    const roomName = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room = await livekit.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: maxParticipants || 20
    });

    // Create class record
    const classRef = db.collection('liveClasses').doc();
    await classRef.set({
      id: classRef.id,
      creatorId: userId,
      title,
      description,
      date: new Date(date),
      duration: duration || 60, // minutes
      price: parseFloat(price) || 0,
      maxParticipants: maxParticipants || 20,
      roomName,
      status: 'scheduled',
      participants: [],
      createdAt: new Date()
    });

    res.json({
      success: true,
      classId: classRef.id,
      roomName,
      message: 'Live class created successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function bookLiveClass(req: Request, res: Response) {
  try {
    const { classId } = req.params;
    const { userId } = req.body;

    const classDoc = await db.collection('liveClasses').doc(classId).get();
    
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    const liveClass = classDoc.data()!;
    
    // Check if class is full
    if (liveClass.participants.length >= liveClass.maxParticipants) {
      return res.status(400).json({ error: 'Class is full' });
    }

    // Check if user already booked
    if (liveClass.participants.includes(userId)) {
      return res.status(400).json({ error: 'Already booked this class' });
    }

    // Add user to participants
    await db.collection('liveClasses').doc(classId).update({
      participants: [...liveClass.participants, userId]
    });

    // Create booking record
    const bookingRef = db.collection('bookings').doc();
    await bookingRef.set({
      id: bookingRef.id,
      classId,
      userId,
      status: 'confirmed',
      bookedAt: new Date()
    });

    res.json({
      success: true,
      bookingId: bookingRef.id,
      message: 'Class booked successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function joinLiveClass(req: Request, res: Response) {
  try {
    const { classId } = req.params;
    const { userId } = req.body;

    const classDoc = await db.collection('liveClasses').doc(classId).get();
    
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    const liveClass = classDoc.data()!;
    
    // Check if user is participant or creator
    if (!liveClass.participants.includes(userId) && liveClass.creatorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to join this class' });
    }

    // Generate access token
    const token = await livekit.createAccessToken(liveClass.roomName, {
      identity: userId,
      name: userId, // Will be replaced with actual user name
      metadata: JSON.stringify({ role: liveClass.creatorId === userId ? 'host' : 'participant' })
    });

    res.json({
      success: true,
      token,
      roomName: liveClass.roomName,
      message: 'Access granted to live class'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

async function getRecentActivity(userId: string) {
  try {
    // Get recent video uploads
    const videosSnapshot = await db
      .collection('videos')
      .where('creatorId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    // Get recent purchases
    const purchasesSnapshot = await db
      .collection('transactions')
      .where('videoId', 'in', videosSnapshot.docs.map(doc => doc.id))
      .where('status', '==', 'paid')
      .orderBy('completedAt', 'desc')
      .limit(10)
      .get();

    return {
      recentUploads: videosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      recentPurchases: purchasesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    };
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return { recentUploads: [], recentPurchases: [] };
  }
}