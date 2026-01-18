# Social Credit System - Quick Reference

## 🎯 For Developers

### Key Concepts
- **Tick (✓)**: "Yes, they locked in" = +1 point
- **Cross (✗)**: "No, they didn't lock in" = -1 point
- **Social Credit Score**: Sum of all tick/cross votes across all user's sessions
- Scores update in real-time using Firestore transactions

### Important Files

#### Services
```typescript
// Get leaderboard
import { getLeaderboard, getFriendLeaderboard } from '@/services/socialCredit';
const rankings = await getLeaderboard(50); // Top 50 users

// Get user's score
import { getUserSocialCredit } from '@/services/socialCredit';
const score = await getUserSocialCredit(userId);
```

#### Components
```typescript
// Display a social credit badge
import { SocialCreditBadge } from '@/components/ui/SocialCreditBadge';

<SocialCreditBadge 
  score={100} 
  size="medium" 
  showLabel={true} 
/>
```

#### Voting
The voting system is already integrated in:
- `SessionCard.tsx` - Shows decision bar on after photo
- `decisions.ts` - Handles all score updates automatically

### Database Schema

#### Profile Document (`profiles/{uid}`)
```typescript
{
  socialCreditScore: number  // Total score from all sessions
}
```

#### Session Document (`sessions/{sessionId}`)
```typescript
{
  tickCount: number           // Number of tick votes
  crossCount: number          // Number of cross votes
  socialCreditDelta: number   // tickCount - crossCount
}
```

#### Decision Document (`sessions/{sessionId}/decisions/{voterUid}`)
```typescript
{
  type: 'tick' | 'cross'
  createdAt: Timestamp
}
```

## 🔧 For Product/Design

### User Journey
1. User completes a session with before/after photos
2. Session appears in friends' feeds
3. Friends swipe to after photo
4. Overlay asks "Did they lock in?"
5. Friends vote with tick or cross buttons
6. Score updates immediately
7. User sees their score on:
   - Home screen (below welcome header)
   - Settings/profile page
   - Leaderboard (new tab)

### Where Scores Appear
- **Settings Screen**: Badge next to member status
- **Friends Tab > Leaderboard View**: Full rankings with your rank card
  - Toggle between Friends list and Leaderboard
  - Shows rank, name, avatar, score
  - Top 3 get medal emojis (🥇🥈🥉)
  - User's row is highlighted

### Visual Design
- **Positive score**: Green border and text (#10B981)
- **Negative score**: Red border and text (#EF4444)
- **Zero score**: Gray border and text (#6B7280)
- **Icons**: 🏆 (positive), 📉 (negative), 📊 (zero)

## 📊 Analytics Opportunities

Track these metrics:
- Average social credit score per user
- Distribution of tick vs cross votes
- Most voted-on sessions
- Users with highest/lowest scores
- Voting engagement rate
- Daily active voters

## 🐛 Troubleshooting

### Scores Not Updating?
Check that Firestore security rules allow:
- Writing to `profiles/{uid}/socialCreditScore`
- Writing to `sessions/{sessionId}/tickCount`, `crossCount`, `socialCreditDelta`
- Writing to `sessions/{sessionId}/decisions/{voterUid}`

### Migration Not Running?
See `MIGRATION.md` for detailed instructions

### Leaderboard Empty?
- Check if users have any completed sessions with votes
- Verify Firestore indexes for:
  - `profiles` collection ordered by `socialCreditScore`
  
## 🚀 Deployment Checklist

- [ ] Run migration script (`src/utils/migration.ts`)
- [ ] Verify Firestore security rules
- [ ] Test voting flow with 2+ users
- [ ] Verify leaderboard displays correctly
- [ ] Check score displays on all screens
- [ ] Test vote changes (tick→cross)
- [ ] Test vote removal

## 💡 Tips

1. **Real-time Updates**: Scores update immediately when friends vote
2. **Atomic Operations**: All score changes use Firestore transactions
3. **Vote Changes**: Users can change their vote (properly handled)
4. **Vote Removal**: Tapping the same button again removes the vote
5. **No Self-Voting**: Users can't vote on their own sessions (enforced in UI)

## 🔮 Future Ideas (Not in MVP)

- Streak multipliers (consecutive ticks = bonus points)
- Weekly/monthly leaderboard resets
- Score history graphs
- Achievements and badges
- Voting notifications
- Score breakdown by activity type
- Voting analytics dashboard
