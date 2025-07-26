export const generateRandomHexColor = (): string => {
  // Menghasilkan string acak 6 karakter dari 0-9 dan A-F
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
};

