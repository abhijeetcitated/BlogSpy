import type {
  TikTokRawVideo,
  TikTokHashtag,
  TikTokTrendingSound,
} from "@/src/features/video-hijack/types/tiktok.types"

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function mapRapidApiItemToRaw(item: any): TikTokRawVideo {
  const author = item.author || {}
  const stats = item.statistics || item.stats || {}
  const video = item.video || {}
  const playAddr = video.play_addr || video.playAddr || {}

  return {
    id: item.aweme_id || item.id || `tt_${Date.now()}`,
    desc: item.desc || "",
    createTime: item.create_time || item.createTime || 0,
    author: {
      id: author.uid || author.id || "",
      uniqueId: author.unique_id || author.uniqueId || "",
      nickname: author.nickname || "",
      followerCount: author.follower_count || author.followerCount || 0,
      verified: author.verification_type > 0 || author.verified || false,
    },
    stats: {
      playCount: stats.play_count || stats.playCount || 0,
      diggCount: stats.digg_count || stats.diggCount || 0,
      shareCount: stats.share_count || stats.shareCount || 0,
      commentCount: stats.comment_count || stats.commentCount || 0,
    },
    video: {
      duration: video.duration || 0,
      cover: video.cover || "",
      originCover: video.origin_cover || video.originCover || "",
      playAddr: {
        urlList: playAddr.url_list || playAddr.urlList || [],
      },
    },
    music: item.music
      ? {
          id: item.music.id || "",
          title: item.music.title || "",
          authorName: item.music.author || item.music.author_name || "",
        }
      : undefined,
    challenges: item.challenges
      ? item.challenges.map((challenge: any) => ({
          title: challenge.title || "",
        }))
      : undefined,
  }
}

export function buildMockTikTokRawResults(query: string, count: number): TikTokRawVideo[] {
  const results: TikTokRawVideo[] = []
  const hashtag = query.replace(/\s+/g, "").toLowerCase()
  const nowSeconds = Math.floor(Date.now() / 1000)

  for (let i = 0; i < count; i += 1) {
    const views = randomInt(50000, 5000000)
    const likes = Math.floor(views * (Math.random() * 0.15 + 0.05))
    const comments = Math.floor(likes * (Math.random() * 0.08 + 0.02))
    const shares = Math.floor(likes * (Math.random() * 0.05 + 0.01))
    const followers = randomInt(5000, 2000000)
    const createTime = nowSeconds - randomInt(1, 30) * 24 * 60 * 60

    results.push({
      id: `mock_tt_${i}_${Date.now()}`,
      desc: `${query} tips you need to know #${hashtag} #fyp #viral`,
      createTime,
      author: {
        id: `user_${i}`,
        uniqueId: `${["viral", "trending", "content", "creator", "tips"][i % 5]}_${i + 1}`,
        nickname: `${["Viral", "Trending", "Content", "Creator", "Tips"][i % 5]} Creator ${i + 1}`,
        followerCount: followers,
        verified: followers > 500000,
      },
      stats: {
        playCount: views,
        diggCount: likes,
        shareCount: shares,
        commentCount: comments,
      },
      video: {
        duration: randomInt(15, 75),
        cover: `https://picsum.photos/seed/${hashtag}${i}/360/640`,
        originCover: `https://picsum.photos/seed/${hashtag}${i}_orig/360/640`,
        playAddr: {
          urlList: [`https://example.com/video/${i}`],
        },
      },
      music: {
        id: `sound_${i}`,
        title: `Original Sound ${i + 1}`,
        authorName: `creator_${i + 1}`,
      },
      challenges: [{ title: `${hashtag}challenge` }],
    })
  }

  return results
}

export function buildMockTikTokVideo(videoId: string): TikTokRawVideo {
  return buildMockTikTokRawResults("video", 1).map((item) => ({
    ...item,
    id: videoId,
  }))[0]
}

export function buildMockHashtag(tag: string): TikTokHashtag {
  return {
    id: `tag_${tag}`,
    name: tag,
    videoCount: randomInt(10000, 500000),
    viewCount: randomInt(10000000, 1000000000),
    isTrending: Math.random() > 0.5,
  }
}

export function buildMockTrendingSounds(): TikTokTrendingSound[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `sound_${i + 1}`,
    name: `Trending Sound ${i + 1}`,
    author: `creator_${i + 1}`,
    videoCount: randomInt(5000, 500000),
    isTrending: true,
  }))
}
