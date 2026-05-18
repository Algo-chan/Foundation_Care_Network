import prisma from '../utils/prisma';

const AVG_CONSULTATION_MINUTES = 20;

export async function calculateWaitTime(doctorId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const confirmedCount = await prisma.appointment.count({
    where: {
      doctorId,
      scheduledAt: { gte: today, lt: tomorrow },
      status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
    },
  });

  return confirmedCount * AVG_CONSULTATION_MINUTES;
}

export interface WorkingHours {
  start: string;
  end: string;
  slotDuration: number;
}

export async function getNextAvailableSlot(doctorId: string): Promise<string | null> {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { workingHours: true },
  });

  if (!doctor?.workingHours) return null;

  const wh = doctor.workingHours as unknown as WorkingHours;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const workStart = new Date(`${todayStr}T${wh.start}:00`);
  const workEnd = new Date(`${todayStr}T${wh.end}:00`);

  if (now >= workEnd) return null;

  let slotStart = now > workStart ? now : workStart;
  slotStart.setMinutes(Math.ceil(slotStart.getMinutes() / 30) * 30, 0, 0);

  const existingAppts = await prisma.appointment.findMany({
    where: {
      doctorId,
      scheduledAt: { gte: slotStart, lt: workEnd },
      status: { not: 'CANCELLED' },
    },
    select: { scheduledAt: true },
    orderBy: { scheduledAt: 'asc' },
  });

  const bookedTimes = new Set(
    existingAppts.map((a: any) => a.scheduledAt.getTime())
  );

  const slotDurationMs = (wh.slotDuration || 30) * 60 * 1000;
  let candidate = new Date(slotStart.getTime());

  while (candidate < workEnd) {
    const isBooked = Array.from(bookedTimes).some(
      (bt: any) => Math.abs(bt - candidate.getTime()) < slotDurationMs
    );
    if (!isBooked) {
      return candidate.toISOString();
    }
    candidate = new Date(candidate.getTime() + slotDurationMs);
  }

  return null;
}

export function formatWaitTime(minutes: number): string {
  if (minutes < 1) return 'No wait';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}
