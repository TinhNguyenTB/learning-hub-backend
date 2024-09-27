import { BadRequestException } from '@nestjs/common';
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

export function validateFields(data: { [key: string]: any }, requiredFields: string[]) {
    // Loop through each field in the requiredFields array and check if it's missing or falsy
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new BadRequestException(`Missing required field`);
        }
    }
    // If all fields are present, return true
    return true;
}

