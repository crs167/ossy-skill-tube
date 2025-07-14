import { Request, Response } from 'express';
import { db, auth } from '../../server';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function signInWithGoogle(req: Request, res: Response) {
  try {
    const { idToken } = req.body;
    
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const { email, name, picture, sub: googleId } = payload;
    
    // Check if user exists
    let userDoc = await db.collection('users').doc(googleId).get();
    
    if (!userDoc.exists) {
      // Create new user with viewer role
      await db.collection('users').doc(googleId).set({
        id: googleId,
        email,
        name,
        picture,
        role: 'viewer',
        walletBalance: 0,
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      // Update last login
      await db.collection('users').doc(googleId).update({
        lastLogin: new Date()
      });
    }

    // Create custom token
    const customToken = await auth.createCustomToken(googleId);
    
    res.json({
      success: true,
      token: customToken,
      user: {
        id: googleId,
        email,
        name,
        picture,
        role: userDoc.exists ? userDoc.data()?.role : 'viewer'
      }
    });
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function sendMagicLink(req: Request, res: Response) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Store token in Firestore
    await db.collection('magicLinks').doc(token).set({
      email,
      expiresAt,
      used: false
    });

    // Send email
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const magicLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Sign in to Ossy Skill Tube',
      html: `
        <h2>Welcome to Ossy Skill Tube!</h2>
        <p>Click the link below to sign in:</p>
        <a href="${magicLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Sign In
        </a>
        <p>This link will expire in 15 minutes.</p>
      `
    });

    res.json({ 
      success: true, 
      message: 'Magic link sent to your email' 
    });
  } catch (error: any) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function verifyMagicLink(req: Request, res: Response) {
  try {
    const { token } = req.params;
    
    const tokenDoc = await db.collection('magicLinks').doc(token).get();
    
    if (!tokenDoc.exists) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const tokenData = tokenDoc.data()!;
    
    if (tokenData.used || new Date() > tokenData.expiresAt.toDate()) {
      return res.status(400).json({ error: 'Token expired or already used' });
    }

    // Mark token as used
    await db.collection('magicLinks').doc(token).update({ used: true });

    // Get or create user
    const email = tokenData.email;
    let userDoc = await db.collection('users').where('email', '==', email).limit(1).get();
    
    let userId: string;
    let userData: any;

    if (userDoc.empty) {
      // Create new user
      const newUserRef = db.collection('users').doc();
      userId = newUserRef.id;
      userData = {
        id: userId,
        email,
        role: 'viewer',
        walletBalance: 0,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      await newUserRef.set(userData);
    } else {
      // Update existing user
      const user = userDoc.docs[0];
      userId = user.id;
      userData = user.data();
      await db.collection('users').doc(userId).update({
        lastLogin: new Date()
      });
    }

    // Create custom token
    const customToken = await auth.createCustomToken(userId);
    
    res.json({
      success: true,
      token: customToken,
      user: userData
    });
  } catch (error: any) {
    console.error('Magic link verification error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function upgradeToCreator(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    await db.collection('users').doc(userId).update({
      role: 'creator',
      upgradedAt: new Date()
    });

    res.json({ 
      success: true, 
      message: 'Upgraded to creator successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserProfile(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: userDoc.data() 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}