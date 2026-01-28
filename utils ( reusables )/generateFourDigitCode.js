export const generateFourDigitCode = () => {
  const code = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return code;
};
