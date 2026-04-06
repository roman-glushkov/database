interface ExistingAppointment {
  id: number;
  date: string;
  service: { duration: number };
}

export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  duration: number,
  existingAppointments: ExistingAppointment[],
  stepMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin <= endMin - duration)
  ) {
    const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin
      .toString()
      .padStart(2, "0")}`;

    const isBusy = existingAppointments.some((app) => {
      const appDate = new Date(app.date);
      const appHour = appDate.getHours();
      const appMin = appDate.getMinutes();
      const appEndHour =
        appHour + Math.floor((appMin + app.service.duration) / 60);
      const appEndMin = (appMin + app.service.duration) % 60;
      const slotEndHour =
        currentHour + Math.floor((currentMin + duration) / 60);
      const slotEndMin = (currentMin + duration) % 60;

      return (
        (currentHour < appEndHour ||
          (currentHour === appEndHour && currentMin < appEndMin)) &&
        (slotEndHour > appHour ||
          (slotEndHour === appHour && slotEndMin > appMin))
      );
    });

    if (!isBusy) {
      slots.push(timeStr);
    }

    currentMin += stepMinutes;
    if (currentMin >= 60) {
      currentHour++;
      currentMin -= 60;
    }
  }
  return slots;
};

export const parseCertificatesToJSON = (
  certificates: string
): string | null => {
  if (!certificates.trim()) return null;
  try {
    const parsed = JSON.parse(certificates);
    return JSON.stringify(parsed);
  } catch {
    return JSON.stringify(certificates);
  }
};
