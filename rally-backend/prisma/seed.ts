import 'dotenv/config';
import { PrismaClient, Category, ActivityStatus, ParticipantRole, ParticipantStatus, ReputationEventType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database records...');
  await prisma.notification.deleteMany();
  await prisma.reputationEvent.deleteMany();
  await prisma.activityParticipant.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Users...');
  const user1 = await prisma.user.create({
    data: {
      id: 'usr_alex_01',
      username: 'alex_sol',
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      reputation: 98,
      bio: 'Solana builder & gaming enthusiast. Hosting web3 hack nights and weekend basketball.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      badges: ['Top Host', 'Early Adopter', 'Solana Dev'],
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'usr_elena_02',
      username: 'elena_r',
      walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      reputation: 94,
      bio: 'Rust learner, UI/UX designer and coffee lover.',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      badges: ['Reliable Member', 'Active Learner'],
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 'usr_marcus_03',
      username: 'marcus_dev',
      walletAddress: '3KzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtChen',
      reputation: 99,
      bio: 'Building on Anchor & Solana. Always up for bouldering and board games.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      badges: ['Top Host', 'Verified Pro', 'Community Leader'],
    },
  });

  const user4 = await prisma.user.create({
    data: {
      id: 'usr_sarah_04',
      username: 'sarah_j',
      walletAddress: '5PzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtSara',
      reputation: 91,
      bio: 'Digital artist exploring generative art on Solana.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      badges: ['Creative Mind'],
    },
  });

  console.log('Seeding Activities...');
  // Activity 1: Development, Online
  const act1 = await prisma.activity.create({
    data: {
      id: 'act_anchor_01',
      title: 'Solana Anchor Workshop & Hack Session',
      description: 'Join us for a hands-on session building custom Solana programs with Anchor. We will cover account constraints, CPIs, and write tests together.',
      category: Category.Development,
      location: 'Discord Voice & Screen Share',
      date: '2026-09-18',
      time: '18:00',
      duration: '2 hours',
      creatorId: user1.id,
      maxParticipants: 8,
      requirements: ['Basic Rust knowledge', 'Solana CLI installed', 'Laptop'],
      status: ActivityStatus.Open,
      isOnline: true,
    },
  });

  // Activity 2: Sports, In-person
  const act2 = await prisma.activity.create({
    data: {
      id: 'act_bball_02',
      title: 'Weekend 3v3 Basketball Pickup Game',
      description: 'Casual 3v3 half-court pickup basketball game. All skill levels welcome, good sportsmanship required!',
      category: Category.Sports,
      location: 'Mission Dolores Park, SF',
      date: '2026-09-20',
      time: '10:00',
      duration: '1.5 hours',
      creatorId: user3.id,
      maxParticipants: 6,
      requirements: ['Basketball shoes', 'Water bottle'],
      status: ActivityStatus.Open,
      isOnline: false,
    },
  });

  // Activity 3: Gaming, Online (Full)
  const act3 = await prisma.activity.create({
    data: {
      id: 'act_valo_03',
      title: 'Valorant Competitive 5-Stack Grind',
      description: 'Looking for 4 players to queue competitive games. Good comms and positive mental attitude only.',
      category: Category.Gaming,
      location: 'Discord Channel',
      date: '2026-09-19',
      time: '20:00',
      duration: '3 hours',
      creatorId: user2.id,
      maxParticipants: 5,
      requirements: ['Platinum+ rank', 'Discord microphone'],
      status: ActivityStatus.Full,
      isOnline: true,
    },
  });

  // Activity 4: Creative, In-person
  const act4 = await prisma.activity.create({
    data: {
      id: 'act_art_04',
      title: 'Generative Art & Shaders Meetup',
      description: 'Show and tell session for GLSL shaders, p5.js sketches, and generative on-chain art.',
      category: Category.Creative,
      location: 'The Commons Coworking, SF',
      date: '2026-09-22',
      time: '17:30',
      duration: '2 hours',
      creatorId: user4.id,
      maxParticipants: 10,
      requirements: ['Show & Tell project', 'Laptop'],
      status: ActivityStatus.Open,
      isOnline: false,
    },
  });

  // Activity 5: Learning, Online
  const act5 = await prisma.activity.create({
    data: {
      id: 'act_rust_05',
      title: 'Beginner Rust Book Club: Chapters 4-6',
      description: 'Discussing ownership, borrowing, lifetimes, and structs from The Rust Programming Language book.',
      category: Category.Learning,
      location: 'Google Meet',
      date: '2026-09-21',
      time: '19:00',
      duration: '1.5 hours',
      creatorId: user1.id,
      maxParticipants: 6,
      requirements: ['Read chapter 4 beforehand'],
      status: ActivityStatus.Open,
      isOnline: true,
    },
  });

  // Activity 6: Social, Completed
  const act6 = await prisma.activity.create({
    data: {
      id: 'act_coffee_06',
      title: 'Morning Coffee & Web3 Ideas Walk',
      description: 'Grabbed coffee and strolled through Hayes Valley discussing emerging crypto trends.',
      category: Category.Social,
      location: 'Blue Bottle Coffee, Hayes Valley',
      date: '2026-09-10',
      time: '09:00',
      duration: '1 hour',
      creatorId: user1.id,
      maxParticipants: 4,
      requirements: ['Good vibes'],
      status: ActivityStatus.Completed,
      isOnline: false,
    },
  });

  console.log('Seeding Activity Participants...');
  // Act 1 participants (creator: user1, joined: user2, user3)
  await prisma.activityParticipant.createMany({
    data: [
      { activityId: act1.id, userId: user1.id, role: ParticipantRole.CREATOR, status: ParticipantStatus.JOINED },
      { activityId: act1.id, userId: user2.id, role: ParticipantRole.PARTICIPANT, status: ParticipantStatus.JOINED },
      { activityId: act1.id, userId: user3.id, role: ParticipantRole.PARTICIPANT, status: ParticipantStatus.JOINED },
    ],
  });

  // Act 2 participants (creator: user3, joined: user1)
  await prisma.activityParticipant.createMany({
    data: [
      { activityId: act2.id, userId: user3.id, role: ParticipantRole.CREATOR, status: ParticipantStatus.JOINED },
      { activityId: act2.id, userId: user1.id, role: ParticipantRole.PARTICIPANT, status: ParticipantStatus.JOINED },
    ],
  });

  // Act 3 (Full): 5 participants (creator: user2, joined: user1, user3, user4, plus 1 simulated)
  await prisma.activityParticipant.createMany({
    data: [
      { activityId: act3.id, userId: user2.id, role: ParticipantRole.CREATOR, status: ParticipantStatus.JOINED },
      { activityId: act3.id, userId: user1.id, role: ParticipantRole.PARTICIPANT, status: ParticipantStatus.JOINED },
      { activityId: act3.id, userId: user3.id, role: ParticipantRole.PARTICIPANT, status: ParticipantStatus.JOINED },
      { activityId: act3.id, userId: user4.id, role: ParticipantRole.PARTICIPANT, status: ParticipantStatus.JOINED },
    ],
  });

  // Act 6 (Completed): user1, user2, user4 attended
  await prisma.activityParticipant.createMany({
    data: [
      { activityId: act6.id, userId: user1.id, role: ParticipantRole.CREATOR, status: ParticipantStatus.ATTENDED },
      { activityId: act6.id, userId: user2.id, role: ParticipantRole.PARTICIPANT, status: ParticipantStatus.ATTENDED },
      { activityId: act6.id, userId: user4.id, role: ParticipantRole.PARTICIPANT, status: ParticipantStatus.ATTENDED },
    ],
  });

  console.log('Seeding Reputation Events...');
  await prisma.reputationEvent.createMany({
    data: [
      {
        userId: user1.id,
        eventType: ReputationEventType.INITIAL_CREDIT,
        change: 90,
        reason: 'Initial account verification & wallet connection',
      },
      {
        userId: user1.id,
        activityId: act6.id,
        eventType: ReputationEventType.HOSTED_SUCCESSFULLY,
        change: 5,
        reason: 'Successfully hosted Morning Coffee & Web3 Ideas Walk',
      },
      {
        userId: user1.id,
        activityId: act6.id,
        eventType: ReputationEventType.ATTENDED,
        change: 3,
        reason: 'Attended completed activity',
      },
      {
        userId: user2.id,
        eventType: ReputationEventType.INITIAL_CREDIT,
        change: 90,
        reason: 'Initial account verification',
      },
      {
        userId: user2.id,
        activityId: act6.id,
        eventType: ReputationEventType.ATTENDED,
        change: 4,
        reason: 'Attended Morning Coffee walk on time',
      },
    ],
  });

  console.log('Seeding Notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        content: 'Elena Rostova joined your activity "Solana Anchor Workshop & Hack Session"!',
        read: false,
        activityId: act1.id,
      },
      {
        userId: user1.id,
        content: 'Marcus Chen joined your activity "Solana Anchor Workshop & Hack Session"!',
        read: true,
        activityId: act1.id,
      },
      {
        userId: user2.id,
        content: 'Your activity "Valorant Competitive 5-Stack Grind" is now full!',
        read: false,
        activityId: act3.id,
      },
      {
        userId: user1.id,
        content: 'You gained +5 reputation points for completing "Morning Coffee & Web3 Ideas Walk"!',
        read: true,
        activityId: act6.id,
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
