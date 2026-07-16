import jwt from 'jsonwebtoken'; import User from '../models/User.js';
export const signAccess=(user)=>jwt.sign({id:user._id,role:user.role},process.env.JWT_ACCESS_SECRET,{expiresIn:process.env.ACCESS_TOKEN_TTL||'15m'});
export const signRefresh=(user)=>jwt.sign({id:user._id},process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.REFRESH_TOKEN_TTL||'30d'});
export async function protect(req,res,next){try{const token=req.headers.authorization?.split(' ')[1];if(!token)return res.status(401).json({message:'Authentication required'});const {id}=jwt.verify(token,process.env.JWT_ACCESS_SECRET);const user=await User.findById(id);if(!user||!user.isActive)return res.status(401).json({message:'Invalid session'});req.user=user;next()}catch{res.status(401).json({message:'Invalid or expired token'})}}
export const authorize=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'Insufficient permissions'});
// Attaches req.user when a valid token is present, but never blocks the request.
export async function softAuth(req,res,next){try{const token=req.headers.authorization?.split(' ')[1];if(token){const {id}=jwt.verify(token,process.env.JWT_ACCESS_SECRET);const user=await User.findById(id);if(user&&user.isActive)req.user=user;}}catch{/* ignore — anonymous */}next()}
