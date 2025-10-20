import { NextRequest, NextResponse } from 'next/server';
import  connectDB  from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { verifyToken, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as any;
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    await connectDB();
    const users = await UserModel.find({}).select('-passwordHash');
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as any;
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    await connectDB();
    
    const { name, email, password, role } = await request.json();
    
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    const passwordHash = await hashPassword(password);
    
    const user = new UserModel({
      name,
      email,
      passwordHash,
      role
    });
    
    await user.save();
    
    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



// ✅ NEW: DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const decoded = verifyToken(token) as any;
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Prevent admin from deleting themselves
    if (userId === decoded.userId) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }
    
    // Find the user to be deleted
    const userToDelete = await UserModel.findById(userId);
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Additional check: Prevent deletion of the last admin
    if (userToDelete.role === 'admin') {
      const adminCount = await UserModel.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return NextResponse.json({ 
          error: 'Cannot delete the last admin user. There must be at least one admin.' 
        }, { status: 400 });
      }
    }
    
    // Delete the user
    await UserModel.findByIdAndDelete(userId);
    
    console.log(`✅ User deleted: ${userToDelete.name} (${userToDelete.email}) by admin: ${decoded.userId}`);
    
    return NextResponse.json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: userToDelete._id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role
      }
    });
    
  } catch (error) {
    console.error('DELETE user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}