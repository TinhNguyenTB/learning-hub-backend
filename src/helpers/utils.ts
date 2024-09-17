import bcrypt from 'bcrypt';
const saltRounds = 10;

export const generateHashPassword = async (plainPassword: string) => {
    try {
        return await bcrypt.hash(plainPassword, saltRounds)
    } catch (error) {
        console.log(error)
    }
}

export const comparePassword = async (plainPassword: string, hashPassword: string) => {
    try {
        return await bcrypt.compare(plainPassword, hashPassword);
    } catch (error) {
        console.log(error)
    }
}

export function generateOTP() {
    // Lấy thời gian hiện tại và tạo một số ngẫu nhiên
    const currentTime = new Date().getTime();
    const randomFactor = Math.floor(Math.random() * 1000000); // Số ngẫu nhiên từ 0 đến 999999

    // Kết hợp thời gian và số ngẫu nhiên
    const otp = (currentTime + randomFactor).toString().slice(-6);

    return otp;
}
