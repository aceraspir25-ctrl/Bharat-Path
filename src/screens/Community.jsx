import { useState, useEffect, useRef } from 'react'
import { db, storage, auth } from '../firebase'
import { useAuth } from '../AuthContext'
import { updateProfile } from 'firebase/auth'
import {
  collection, addDoc, onSnapshot, orderBy, query,
  serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove,
  setDoc, deleteDoc, where, limit
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import './Community.css'

// ─── UTILS ────────────────────────────────────────────────
const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_')

const timeAgo = (ts) => {
  if (!ts?.toDate) return 'Just now'
  const diff = (Date.now() - ts.toDate().getTime()) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return ts.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ─── SKELETON ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="post-card" style={{ pointerEvents: 'none' }}>
      <div className="post-header">
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite'
        }} />
        <div style={{ flex: 1, marginLeft: 10 }}>
          <div className="skeleton-line" style={{ height: 12, width: '40%', marginBottom: 6 }} />
          <div className="skeleton-line" style={{ height: 10, width: '25%' }} />
        </div>
      </div>
      <div className="skeleton-line" style={{ height: 200, margin: '12px 0', borderRadius: 12 }} />
      <div style={{ padding: '0 16px 16px' }}>
        <div className="skeleton-line" style={{ height: 10, width: '80%', marginBottom: 8 }} />
        <div className="skeleton-line" style={{ height: 10, width: '60%' }} />
      </div>
    </div>
  )
}

// ─── AVATAR ───────────────────────────────────────────────
function Avatar({ user: u, size = 40, fontSize = 14, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#FF6B35,#F7C948)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, color: '#fff', overflow: 'hidden',
      position: 'relative', ...style
    }}>
      {u?.photoURL
        ? <img src={u.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        : (u?.displayName || u?.name || '?').charAt(0).toUpperCase()
      }
    </div>
  )
}

// ─── COMMENTS PANEL ───────────────────────────────────────
function CommentsPanel({ postId, currentUser, onClose }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const endRef = useRef(null)

  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })
    return unsub
  }, [postId])

  const sendComment = async () => {
    if (!text.trim()) return
    const trimmed = text.trim()
    setText('')
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        text: trimmed,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        userPhoto: currentUser.photoURL || null,
        createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'posts', postId), {
        comments: comments.length + 1
      })
    } catch (e) {
      console.error('Comment error:', e)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', width: '100%', maxWidth: 560,
        borderRadius: '20px 20px 0 0', maxHeight: '75vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Comments</div>
          <div onClick={onClose} style={{ cursor: 'pointer', fontSize: 22, color: '#888', lineHeight: 1 }}>×</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {loading && <div style={{ textAlign: 'center', padding: 20, color: '#aaa', fontSize: 13 }}>Loading...</div>}
          {!loading && comments.length === 0 && (
            <div style={{ textAlign: 'center', padding: 30, color: '#aaa', fontSize: 13 }}>Pehla comment karo! 💬</div>
          )}
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <Avatar user={{ photoURL: c.userPhoto, displayName: c.userName }} size={32} fontSize={12} />
              <div style={{ background: '#f8f8f8', borderRadius: '0 12px 12px 12px', padding: '8px 12px', flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FF6B35', marginBottom: 3 }}>{c.userName}</div>
                <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{c.text}</div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>{timeAgo(c.createdAt)}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div style={{
          padding: '12px 16px', borderTop: '1px solid #f0f0f0',
          display: 'flex', gap: 8, alignItems: 'center', background: '#fff'
        }}>
          <Avatar user={currentUser} size={32} fontSize={12} />
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendComment()}
            placeholder="Comment likho..."
            style={{
              flex: 1, padding: '9px 14px', borderRadius: 20,
              border: '1.5px solid #eee', fontSize: 13,
              fontFamily: 'DM Sans,sans-serif', outline: 'none', background: '#fafafa'
            }}
          />
          <button onClick={sendComment} disabled={!text.trim()} style={{
            padding: '9px 16px', borderRadius: 20,
            background: text.trim() ? '#FF6B35' : '#eee',
            color: text.trim() ? '#fff' : '#aaa',
            border: 'none', cursor: text.trim() ? 'pointer' : 'default',
            fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
            fontFamily: 'DM Sans,sans-serif'
          }}>Post</button>
        </div>
      </div>
    </div>
  )
}

// ─── POST CARD ────────────────────────────────────────────
function PostCard({ post, currentUser }) {
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?.uid))
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comments || 0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLiked(post.likes?.includes(currentUser?.uid))
    setLikeCount(post.likes?.length || 0)
    setCommentCount(post.comments || 0)
  }, [post.likes, post.comments, currentUser?.uid])

  const toggleLike = async () => {
    if (!currentUser) return
    const postRef = doc(db, 'posts', post.id)
    const newLiked = !liked

    // Heart bounce animation
    const heartEl = document.getElementById(`heart-${post.id}`)
    if (heartEl) {
      heartEl.classList.remove('like-animate')
      void heartEl.offsetWidth
      heartEl.classList.add('like-animate')
    }

    setLiked(newLiked)
    setLikeCount(c => newLiked ? c + 1 : c - 1)

    try {
      await updateDoc(postRef, {
        likes: newLiked ? arrayUnion(currentUser.uid) : arrayRemove(currentUser.uid)
      })
      if (newLiked && post.userId !== currentUser.uid) {
        await addDoc(collection(db, 'notifications'), {
          toUserId: post.userId,
          fromUserId: currentUser.uid,
          fromUserName: currentUser.displayName || 'Someone',
          fromUserPhoto: currentUser.photoURL || null,
          type: 'like',
          postId: post.id,
          message: `${currentUser.displayName || 'Someone'} ne tumhara post like kiya ❤️`,
          read: false,
          createdAt: serverTimestamp(),
        })
      }
    } catch (e) {
      setLiked(!newLiked)
      setLikeCount(c => newLiked ? c - 1 : c + 1)
      console.error('Like error:', e)
    }
  }

  return (
    <>
      <div className="post-card">
        <div className="post-header">
          <Avatar user={{ photoURL: post.userPhoto, displayName: post.userName }} size={40} />
          <div style={{ flex: 1, marginLeft: 10 }}>
            <div className="ph-name">{post.userName}</div>
            <div className="ph-meta">📍 {post.location || 'India'}</div>
          </div>
          <div className="ph-time">{timeAgo(post.createdAt)}</div>
        </div>

        <div className="post-img" style={{
          padding: 0,
          background: post.imageUrl ? 'none' : 'linear-gradient(135deg,#FFF0E8,#FFF8E0)'
        }}>
          {post.imageUrl
            ? <img src={post.imageUrl} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>🌅</div>
          }
          {post.location && <div className="post-loc-tag">📍 {post.location}</div>}
        </div>

        <div className="post-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span
                id={`heart-${post.id}`}
                style={{ fontSize: 20, cursor: 'pointer', display: 'inline-block', userSelect: 'none' }}
                onClick={toggleLike}
              >
                {liked ? '❤️' : '🤍'}
              </span>
              <span style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>{likeCount}</span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 20, cursor: 'pointer' }} onClick={() => setShowComments(true)}>💬</span>
              <span style={{ fontSize: 20, cursor: 'pointer' }}
                onClick={() => navigator.share?.({ title: post.userName, text: post.caption }) ?? alert('Link copied!')}>↗️</span>
              <span style={{ fontSize: 20, cursor: 'pointer', filter: saved ? 'none' : 'grayscale(1)', transition: 'filter 0.2s' }}
                onClick={() => setSaved(s => !s)}>🔖</span>
            </div>
          </div>
          <div className="post-caption">{post.caption}</div>
          {post.tags && (
            <div className="post-tags">
              {post.tags.split(' ').filter(t => t.startsWith('#')).map((t, i) => (
                <span key={i} className="hashtag">{t} </span>
              ))}
            </div>
          )}
          {commentCount > 0 && (
            <div onClick={() => setShowComments(true)}
              style={{ fontSize: 12, color: '#888', marginTop: 6, cursor: 'pointer' }}>
              View all {commentCount} comment{commentCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {showComments && (
        <CommentsPanel postId={post.id} currentUser={currentUser} onClose={() => setShowComments(false)} />
      )}
    </>
  )
}

// ─── STORIES SECTION ──────────────────────────────────────
function StoriesSection({ currentUser }) {
  const [stories, setStories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [viewStory, setViewStory] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const q = query(
      collection(db, 'stories'),
      where('createdAt', '>', cutoff),
      orderBy('createdAt', 'desc'),
      limit(20)
    )
    const unsub = onSnapshot(q, snap => {
      setStories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const uploadStory = async (file) => {
    if (!file || !currentUser) return
    setUploading(true)
    try {
      const imgRef = ref(storage, `stories/${currentUser.uid}/${Date.now()}`)
      await uploadBytes(imgRef, file)
      const imageUrl = await getDownloadURL(imgRef)
      await addDoc(collection(db, 'stories'), {
        imageUrl,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        userPhoto: currentUser.photoURL || null,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        views: [],
      })
    } catch (e) {
      console.error('Story upload error:', e)
      // CORS error pe silently fail — text-only mode
    }
    setUploading(false)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '4px 0 12px', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div onClick={() => fileRef.current?.click()} style={{
            width: 60, height: 60, borderRadius: '50%',
            border: '2.5px dashed #FF6B35', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#FFF0E8', fontSize: 22
          }}>
            {uploading ? '⏳' : '➕'}
          </div>
          <div style={{ fontSize: 10, color: '#888', textAlign: 'center', maxWidth: 60 }}>
            {uploading ? 'Uploading...' : 'Add Story'}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => uploadStory(e.target.files[0])} />
        </div>
        {stories.map(story => (
          <div key={story.id} onClick={() => setViewStory(story)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, cursor: 'pointer' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', overflow: 'hidden',
              padding: 2, background: 'linear-gradient(135deg,#FF6B35,#F7C948)'
            }}>
              {story.imageUrl
                ? <img src={story.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="" />
                : <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFF0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌅</div>
              }
            </div>
            <div style={{ fontSize: 10, color: '#555', maxWidth: 60, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {story.userName?.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>

      {viewStory && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setViewStory(null)}>
          <div style={{ position: 'relative', maxWidth: 400, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 3, background: '#333', borderRadius: 2, margin: '0 16px 12px' }}>
              <div style={{ height: '100%', background: '#FF6B35', borderRadius: 2, width: '60%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px 10px' }}>
              <Avatar user={{ photoURL: viewStory.userPhoto, displayName: viewStory.userName }} size={36} />
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{viewStory.userName}</div>
              <div style={{ color: '#aaa', fontSize: 11, marginLeft: 'auto' }}>{timeAgo(viewStory.createdAt)}</div>
              <div onClick={() => setViewStory(null)} style={{ color: '#fff', fontSize: 24, cursor: 'pointer', marginLeft: 8 }}>×</div>
            </div>
            <div style={{ aspectRatio: '9/16', background: '#111', borderRadius: 16, overflow: 'hidden', maxHeight: '70vh' }}>
              {viewStory.imageUrl
                ? <img src={viewStory.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 64 }}>🌅</div>
              }
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── NOTIFICATIONS TAB ────────────────────────────────────
function NotificationsTab({ currentUser }) {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser?.uid) return
    const q = query(
      collection(db, 'notifications'),
      where('toUserId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    )
    const unsub = onSnapshot(q, snap => {
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [currentUser?.uid])

  const markAllRead = async () => {
    await Promise.all(notifs.filter(n => !n.read).map(n =>
      updateDoc(doc(db, 'notifications', n.id), { read: true })
    ))
  }

  const unreadCount = notifs.filter(n => !n.read).length
  const notifIcon = (type) => ({ like: '❤️', comment: '💬', follow: '👤', group: '👥' }[type] || '🔔')

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 13 }}>Loading...</div>

  return (
    <div className="tab-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="card-title" style={{ marginBottom: 0 }}>
          Notifications
          {unreadCount > 0 && (
            <span style={{ marginLeft: 8, background: '#FF6B35', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 11 }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <div onClick={markAllRead} style={{ fontSize: 12, color: '#FF6B35', cursor: 'pointer', fontWeight: 600 }}>
            Mark all read
          </div>
        )}
      </div>
      {notifs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔔</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>Abhi koi notification nahi</div>
        </div>
      )}
      {notifs.map(n => (
        <div key={n.id} className="notif-item" style={{
          background: n.read ? '#fff' : '#FFF8F5',
          borderLeft: `3px solid ${n.read ? 'transparent' : '#FF6B35'}`
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#FF6B35,#F7C948)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, overflow: 'hidden'
          }}>
            {n.fromUserPhoto
              ? <img src={n.fromUserPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : notifIcon(n.type)
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#333', lineHeight: 1.5 }}>{n.message}</div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
          </div>
          {!n.read && (
            <div onClick={() => updateDoc(doc(db, 'notifications', n.id), { read: true })}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B35', flexShrink: 0, cursor: 'pointer' }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── FOLLOW BUTTON ────────────────────────────────────────
function FollowButton({ targetUserId, currentUser }) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser?.uid || !targetUserId) return
    const unsub = onSnapshot(
      doc(db, 'users', currentUser.uid, 'following', targetUserId),
      snap => { setFollowing(snap.exists()); setLoading(false) }
    )
    return unsub
  }, [currentUser?.uid, targetUserId])

  const toggle = async () => {
    if (!currentUser) return
    const wasFollowing = following
    setFollowing(f => !f)
    const followRef = doc(db, 'users', currentUser.uid, 'following', targetUserId)
    const followerRef = doc(db, 'users', targetUserId, 'followers', currentUser.uid)
    try {
      if (wasFollowing) {
        await deleteDoc(followRef)
        await deleteDoc(followerRef)
      } else {
        await setDoc(followRef, { userId: targetUserId, followedAt: serverTimestamp() })
        await setDoc(followerRef, { userId: currentUser.uid, followedAt: serverTimestamp() })
        await addDoc(collection(db, 'notifications'), {
          toUserId: targetUserId,
          fromUserId: currentUser.uid,
          fromUserName: currentUser.displayName || 'Someone',
          fromUserPhoto: currentUser.photoURL || null,
          type: 'follow',
          message: `${currentUser.displayName || 'Someone'} ab tumhe follow kar raha hai 👤`,
          read: false,
          createdAt: serverTimestamp(),
        })
      }
    } catch (e) {
      setFollowing(wasFollowing)
      console.error('Follow error:', e)
    }
  }

  if (loading) return null
  return (
    <button onClick={toggle} style={{
      padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      border: following ? '1.5px solid #FF6B35' : 'none',
      background: following ? '#fff' : '#FF6B35',
      color: following ? '#FF6B35' : '#fff',
      cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans,sans-serif'
    }}>
      {following ? 'Following ✓' : 'Follow'}
    </button>
  )
}

// ─── CHAT PANEL ───────────────────────────────────────────
function ChatPanel({ currentUser }) {
  const [chatUsers, setChatUsers] = useState([])
  const [openChat, setOpenChat] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const msgEndRef = useRef(null)

  useEffect(() => {
    if (!currentUser?.uid) return
    const unsub = onSnapshot(query(collection(db, 'users'), limit(10)), snap => {
      setChatUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== currentUser.uid))
      setLoadingUsers(false)
    })
    return unsub
  }, [currentUser?.uid])

  useEffect(() => {
    if (!openChat || !currentUser?.uid) return
    const chatId = getChatId(currentUser.uid, openChat.id)
    const unsub = onSnapshot(
      query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'), limit(50)),
      snap => {
        setMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    )
    return unsub
  }, [openChat, currentUser?.uid])

  const sendMsg = async () => {
    if (!input.trim() || !openChat || !currentUser) return
    const text = input.trim()
    setInput('')
    const chatId = getChatId(currentUser.uid, openChat.id)
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text, senderId: currentUser.uid,
        senderName: currentUser.displayName || 'User',
        createdAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'chats', chatId), {
        participants: [currentUser.uid, openChat.id],
        lastMessage: text, lastMessageAt: serverTimestamp(),
      }, { merge: true })
    } catch (e) { console.error('Send message error:', e) }
  }

  if (openChat) return (
    <div className="open-chat">
      <div className="oc-header">
        <div className="oc-back" onClick={() => { setOpenChat(null); setMsgs([]) }}>←</div>
        <Avatar user={openChat} size={32} fontSize={12} />
        <div style={{ marginLeft: 8, flex: 1 }}>
          <div className="oc-name">{openChat.displayName || 'User'}</div>
          <div className="oc-status" style={{ color: openChat.online ? '#4ADE80' : '#aaa' }}>
            {openChat.online ? '● Online' : '○ Offline'}
          </div>
        </div>
        <div className="call-btns">
          <div className="call-btn" onClick={() => alert('Voice call coming soon!')}>📞</div>
          <div className="call-btn video" onClick={() => alert('Video call coming soon!')}>📹</div>
        </div>
      </div>
      <div className="msg-area">
        {msgs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, fontSize: 12, color: '#aaa' }}>Conversation shuru karo! 👋</div>
        )}
        {msgs.map(m => (
          <div key={m.id} className={m.senderId === currentUser.uid ? 'msg-me' : 'msg-them'}>
            <div>{m.text}</div>
            <div style={{ fontSize: 9, opacity: 0.6, marginTop: 3, textAlign: m.senderId === currentUser.uid ? 'right' : 'left' }}>
              {timeAgo(m.createdAt)}
            </div>
          </div>
        ))}
        <div ref={msgEndRef} />
      </div>
      <div className="msg-input-row">
        <input className="msg-input" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Message likho..." />
        <button className="msg-send btn-primary" onClick={sendMsg} disabled={!input.trim()}>Send</button>
      </div>
    </div>
  )

  return (
    <div className="chat-list-wrap">
      <div className="cs-header">
        <div className="cs-title">Messages</div>
        <div className="cs-new">+ New</div>
      </div>
      {loadingUsers && <div style={{ textAlign: 'center', padding: 16, fontSize: 12, color: '#aaa' }}>Loading...</div>}
      {!loadingUsers && chatUsers.length === 0 && (
        <div style={{ textAlign: 'center', padding: 16, fontSize: 12, color: '#aaa' }}>Koi user nahi mila 🤷</div>
      )}
      {chatUsers.map(u => (
        <div key={u.id} className="chat-user" onClick={() => setOpenChat(u)}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar user={u} size={36} fontSize={13} />
            {u.online && (
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#4ADE80', border: '2px solid #fff' }} />
            )}
          </div>
          <div className="cu-info">
            <div className="cu-name">{u.displayName || 'User'}</div>
            <div className="cu-preview">{u.lastMessage || 'Tap to chat'}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── SUGGESTED USERS ──────────────────────────────────────
function SuggestedUsers({ currentUser }) {
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!currentUser?.uid) return
    const unsub = onSnapshot(query(collection(db, 'users'), limit(5)), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== currentUser.uid).slice(0, 4))
    })
    return unsub
  }, [currentUser?.uid])

  if (users.length === 0) return (
    <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center', padding: '8px 0' }}>Koi user nahi mila abhi</div>
  )

  return (
    <>
      {users.map(u => (
        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Avatar user={u} size={36} fontSize={13} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u.displayName || 'User'}
            </div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Spiritual traveler</div>
          </div>
          <FollowButton targetUserId={u.id} currentUser={currentUser} />
        </div>
      ))}
    </>
  )
}

// ─── GROUPS PREVIEW ───────────────────────────────────────
function GroupsPreview({ onViewAll }) {
  const [groups, setGroups] = useState([])

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'groups'), orderBy('createdAt', 'desc'), limit(3)),
      snap => setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    return unsub
  }, [])

  if (groups.length === 0) return (
    <div style={{ fontSize: 12, color: '#aaa', padding: '8px 14px', textAlign: 'center' }}>Koi group nahi — ek banao! 🙏</div>
  )

  return (
    <>
      {groups.map(g => (
        <div key={g.id} className="group-item">
          <div className="gi-icon" style={{ background: '#FFF0E8' }}>{g.icon || '🕉️'}</div>
          <div>
            <div className="gi-name">{g.name}</div>
            <div className="gi-members">{g.memberCount || 1} members</div>
          </div>
          <div className="gi-btn" onClick={onViewAll}>View</div>
        </div>
      ))}
    </>
  )
}

// ─── PROFILE TAB — with photo update ──────────────────────
function ProfileTab({ currentUser, posts }) {
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '')
  const [uploading, setUploading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '')
  const [saving, setSaving] = useState(false)
  const photoRef = useRef(null)

  useEffect(() => {
    if (!currentUser?.uid) return
    const unsubF = onSnapshot(collection(db, 'users', currentUser.uid, 'followers'), snap => setFollowerCount(snap.size))
    const unsubFg = onSnapshot(collection(db, 'users', currentUser.uid, 'following'), snap => setFollowingCount(snap.size))
    return () => { unsubF(); unsubFg() }
  }, [currentUser?.uid])

  useEffect(() => {
    if (!currentUser?.uid) return
    setDoc(doc(db, 'users', currentUser.uid), {
      displayName: currentUser.displayName || '',
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || '',
      online: true,
      lastSeen: serverTimestamp(),
    }, { merge: true })
  }, [currentUser?.uid])

  // ── Profile photo upload ──
  const uploadProfilePhoto = async (file) => {
    if (!file || !currentUser) return
    setUploading(true)
    try {
      const imgRef = ref(storage, `profiles/${currentUser.uid}/avatar`)
      await uploadBytes(imgRef, file)
      const url = await getDownloadURL(imgRef)

      // Firebase Auth mein update
      await updateProfile(auth.currentUser, { photoURL: url })

      // Firestore mein update
      await setDoc(doc(db, 'users', currentUser.uid), { photoURL: url }, { merge: true })

      setPhotoURL(url)
      alert('✅ Profile photo update ho gayi!')
    } catch (e) {
      console.error('Photo upload error:', e)
      // CORS error — Firestore mein save karo, Storage baad mein
      alert('⚠️ CORS issue — Storage fix hone ke baad photo upload hogi. Tab tak naam update karo!')
    }
    setUploading(false)
  }

  // ── Display name update ──
  const saveProfile = async () => {
    if (!displayName.trim()) return
    setSaving(true)
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() })
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: displayName.trim(),
      }, { merge: true })
      setEditMode(false)
      alert('✅ Profile update ho gayi!')
    } catch (e) {
      console.error('Profile save error:', e)
      alert('Error: ' + e.message)
    }
    setSaving(false)
  }

  const myPosts = posts.filter(p => p.userId === currentUser?.uid)
  const displayPhoto = photoURL || currentUser?.photoURL

  return (
    <div className="tab-content">
      <div className="card profile-card">
        {/* Profile Photo with upload */}
        <div className="profile-pic-wrap">
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg,#FF6B35,#F7C948)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 700, color: '#fff', overflow: 'hidden',
            border: '3px solid white', boxShadow: '0 0 0 3px #FF6B35',
            margin: '0 auto', cursor: 'pointer', position: 'relative'
          }} onClick={() => photoRef.current?.click()}>
            {uploading
              ? <div style={{ fontSize: 14 }}>⏳</div>
              : displayPhoto
                ? <img src={displayPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : (currentUser?.displayName || 'U').charAt(0).toUpperCase()
            }
            {/* Camera overlay */}
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s', borderRadius: '50%',
              fontSize: 20
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >📷</div>
          </div>
          <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => uploadProfilePhoto(e.target.files[0])} />
          <div className="edit-btn" onClick={() => photoRef.current?.click()}>
            {uploading ? '⏳' : '📷'}
          </div>
        </div>

        {/* Name — edit mode */}
        {editMode ? (
          <div style={{ margin: '12px auto', maxWidth: 220 }}>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 10,
                border: '1.5px solid #FF6B35', fontSize: 15, fontWeight: 600,
                textAlign: 'center', outline: 'none', fontFamily: 'DM Sans,sans-serif',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
              <button onClick={saveProfile} disabled={saving} style={{
                padding: '7px 18px', borderRadius: 20, background: '#FF6B35',
                color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: 600, fontFamily: 'DM Sans,sans-serif'
              }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => { setEditMode(false); setDisplayName(currentUser?.displayName || '') }} style={{
                padding: '7px 18px', borderRadius: 20, background: '#eee',
                color: '#666', border: 'none', cursor: 'pointer', fontSize: 13,
                fontFamily: 'DM Sans,sans-serif'
              }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-name" style={{ marginTop: 12 }}>{currentUser?.displayName}</div>
            <div className="profile-bio">{currentUser?.email}</div>
            <div className="profile-loc">📍 India · Spiritual Traveler</div>
          </>
        )}

        <div className="profile-stats">
          <div className="ps-item">
            <div className="ps-val">{myPosts.length}</div>
            <div className="ps-label">Posts</div>
          </div>
          <div className="ps-item">
            <div className="ps-val">{followerCount}</div>
            <div className="ps-label">Followers</div>
          </div>
          <div className="ps-item">
            <div className="ps-val">{followingCount}</div>
            <div className="ps-label">Following</div>
          </div>
        </div>
        <div className="profile-btns">
          <button className="btn-primary" onClick={() => setEditMode(true)}>✏️ Edit Profile</button>
          <button className="btn-secondary">Share</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">My Posts ({myPosts.length})</div>
        <div className="profile-grid">
          {myPosts.map((p, i) => (
            <div key={i} className="pg-item">
              {p.imageUrl
                ? <img src={p.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : '🌅'
              }
            </div>
          ))}
          {myPosts.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 24, fontSize: 12, color: '#aaa' }}>
              Koi post nahi — abhi share karo! 🌟
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── GROUPS TAB ───────────────────────────────────────────
function GroupsTab({ currentUser }) {
  const [groups, setGroups] = useState([])
  const [creating, setCreating] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'groups'), orderBy('createdAt', 'desc'), limit(20)),
      snap => { setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) }
    )
    return unsub
  }, [])

  const createGroup = async () => {
    if (!groupName.trim()) return
    try {
      await addDoc(collection(db, 'groups'), {
        name: groupName.trim(), description: groupDesc.trim(),
        creatorId: currentUser.uid, creatorName: currentUser.displayName || 'User',
        members: [currentUser.uid], memberCount: 1, icon: '🕉️',
        createdAt: serverTimestamp(),
      })
      setGroupName(''); setGroupDesc(''); setCreating(false)
    } catch (e) { console.error('Create group error:', e) }
  }

  const joinGroup = async (group) => {
    const joined = group.members?.includes(currentUser.uid)
    try {
      await updateDoc(doc(db, 'groups', group.id), {
        members: joined ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
        memberCount: joined ? (group.memberCount || 1) - 1 : (group.memberCount || 0) + 1
      })
    } catch (e) { console.error('Join group error:', e) }
  }

  return (
    <div className="tab-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="section-title">Travel Groups</div>
        <button className="btn-primary" onClick={() => setCreating(c => !c)}>
          {creating ? 'Cancel' : '+ Create Group'}
        </button>
      </div>
      {creating && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">New Group</div>
          <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group ka naam..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #eee', fontSize: 13, marginBottom: 10, fontFamily: 'DM Sans,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          <input value={groupDesc} onChange={e => setGroupDesc(e.target.value)} placeholder="Description (optional)..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #eee', fontSize: 13, marginBottom: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          <button className="btn-primary" onClick={createGroup} disabled={!groupName.trim()} style={{ width: '100%' }}>
            Create Group
          </button>
        </div>
      )}
      {loading && <div style={{ textAlign: 'center', padding: 30, color: '#aaa', fontSize: 13 }}>Loading groups...</div>}
      <div className="grid2">
        {groups.map(g => {
          const joined = g.members?.includes(currentUser?.uid)
          return (
            <div key={g.id} className="group-card">
              <div className="gc-header">
                <div className="gc-icon" style={{ background: '#FFF0E8' }}>{g.icon || '🕉️'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="gc-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                  <div className="gc-count">{g.memberCount || 1} member{(g.memberCount || 1) !== 1 ? 's' : ''}</div>
                </div>
              </div>
              {g.description && <div style={{ fontSize: 11, color: '#888', margin: '6px 0 10px', lineHeight: 1.5 }}>{g.description}</div>}
              <div className="gc-actions">
                <div className="gc-btn" onClick={() => alert('Group chat coming soon!')}>💬 Chat</div>
                <div className="gc-btn" onClick={() => alert('Trip planning coming soon!')}>🗺️ Plan</div>
                <div className="gc-btn" onClick={() => joinGroup(g)}
                  style={{ background: joined ? '#eee' : '#FF6B35', color: joined ? '#666' : '#fff', border: 'none' }}>
                  {joined ? 'Leave' : 'Join'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {!loading && groups.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>Koi group nahi — pehla group banao!</div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMMUNITY ───────────────────────────────────────
export default function Community() {
  const { user } = useAuth()
  const [tab, setTab] = useState('feed')
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState('')
  const [image, setImage] = useState(null)
  const [posting, setPosting] = useState(false)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const fileRef = useRef(null)

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20)),
      snap => { setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setPostsLoading(false) }
    )
    return unsub
  }, [])

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(
      query(collection(db, 'notifications'), where('toUserId', '==', user.uid), where('read', '==', false)),
      snap => setUnreadNotifs(snap.size)
    )
    return unsub
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) return
    setDoc(doc(db, 'users', user.uid), {
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      online: true,
      lastSeen: serverTimestamp(),
    }, { merge: true })
  }, [user?.uid])

  // ── submitPost — image try karo, CORS pe text-only fallback ──
  const submitPost = async () => {
    if (!caption.trim()) return alert('Caption likho!')
    if (!user) return alert('Pehle login karo!')
    setPosting(true)
    try {
      let imageUrl = null

      if (image) {
        try {
          const imgRef = ref(storage, `posts/${user.uid}/${Date.now()}`)
          await uploadBytes(imgRef, image)
          imageUrl = await getDownloadURL(imgRef)
        } catch (storageErr) {
          console.warn('⚠️ Image upload failed (CORS) — text-only post ho raha hai:', storageErr.message)
          // Image skip — text post continue
        }
      }

      await addDoc(collection(db, 'posts'), {
        caption, location, tags,
        imageUrl, // null agar CORS fail hua
        userName: user.displayName || 'User',
        userPhoto: user.photoURL || null,
        userId: user.uid,
        likes: [],
        comments: 0,
        createdAt: serverTimestamp(),
      })

      setCaption(''); setLocation(''); setTags(''); setImage(null)
    } catch (e) {
      console.error('❌ Post error:', e)
      alert('Post nahi ho saka: ' + e.message)
    }
    setPosting(false)
  }

  const tabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'stories', label: 'Stories' },
    { id: 'groups', label: 'Groups' },
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifs', badge: unreadNotifs },
  ]

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔐</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>Community access ke liye login karo</div>
      <div style={{ fontSize: 13, color: '#888' }}>Google se login karo to continue</div>
    </div>
  )

  return (
    <div className="community">
      <div className="comm-tabs">
        {tabs.map(t => (
          <div key={t.id} className={`comm-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.badge > 0 && <span className="notif-count">{t.badge}</span>}
          </div>
        ))}
      </div>

      {tab === 'feed' && (
        <div className="feed-wrap">
          <div className="feed-col">
            <div className="card" style={{ padding: '14px 16px 4px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 10, letterSpacing: 0.8, textTransform: 'uppercase' }}>Stories</div>
              <StoriesSection currentUser={user} />
            </div>

            <div className="card create-post">
              <div className="cp-top">
                <Avatar user={user} size={36} fontSize={13} />
                <textarea value={caption} onChange={e => setCaption(e.target.value)}
                  placeholder="Apna spiritual travel experience share karo... 🙏"
                  style={{
                    flex: 1, background: 'var(--cream)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '9px 14px', fontSize: 12,
                    fontFamily: 'DM Sans,sans-serif', outline: 'none',
                    color: 'var(--dark)', resize: 'none', height: 60
                  }} />
              </div>
              {image && (
                <div style={{ margin: '6px 0', fontSize: 12, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📷 {image.name}
                  <span onClick={() => setImage(null)} style={{ color: '#f00', cursor: 'pointer', fontWeight: 700 }}>×</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="📍 Location"
                  style={{ flex: 1, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontFamily: 'DM Sans,sans-serif', outline: 'none', color: 'var(--dark)' }} />
                <input value={tags} onChange={e => setTags(e.target.value)} placeholder="#Varanasi #Spiritual"
                  style={{ flex: 1, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontFamily: 'DM Sans,sans-serif', outline: 'none', color: 'var(--dark)' }} />
              </div>
              <div className="cp-bottom">
                <div className="cp-btns">
                  <div className="cp-btn" onClick={() => fileRef.current?.click()}>📷 Photo</div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImage(e.target.files[0])} />
                  <div className="cp-btn" onClick={() => alert('Video coming soon!')}>🎥 Video</div>
                  <div className="cp-btn" onClick={() => alert('Feeling picker coming soon!')}>😊 Feeling</div>
                </div>
                <button className="btn-primary" onClick={submitPost} disabled={posting || !caption.trim()}
                  style={{ opacity: posting || !caption.trim() ? 0.6 : 1 }}>
                  {posting ? '⏳ Posting...' : 'Post'}
                </button>
              </div>
            </div>

            {postsLoading && [1, 2].map(i => <SkeletonCard key={i} />)}
            {!postsLoading && posts.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 36 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🌟</div>
                <div style={{ fontSize: 14, color: '#333', fontWeight: 600 }}>Pehla post karo!</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>Apna spiritual travel experience share karo</div>
              </div>
            )}
            {posts.map(post => (
              <PostCard key={post.id} post={post} currentUser={user} />
            ))}
          </div>

          <div className="right-col">
            <div className="chat-section"><ChatPanel currentUser={user} /></div>
            <div className="card" style={{ padding: 16, borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 12 }}>Suggested Travelers</div>
              <SuggestedUsers currentUser={user} />
            </div>
            <div className="groups-section">
              <div className="gs-header">
                <div className="gs-title">My Groups</div>
                <div className="gs-new" onClick={() => setTab('groups')}>+ Create</div>
              </div>
              <GroupsPreview onViewAll={() => setTab('groups')} />
            </div>
          </div>
        </div>
      )}

      {tab === 'stories' && (
        <div className="tab-content">
          <div className="card">
            <div className="card-title">Stories</div>
            <StoriesSection currentUser={user} />
          </div>
        </div>
      )}

      {tab === 'groups' && <GroupsTab currentUser={user} />}
      {tab === 'profile' && <ProfileTab currentUser={user} posts={posts} />}
      {tab === 'notifications' && <NotificationsTab currentUser={user} />}
    </div>
  )
}