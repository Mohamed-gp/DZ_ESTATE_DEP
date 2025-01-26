import crypto from "crypto";

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

const encrypt = (text: string): string => {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Use a more secure key derivation method
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
  
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedData: string): string => {
  // Split IV and encrypted text
  const [ivHex, encryptedHex] = encryptedData.split(':');
  
  // Derive key using same method as encryption
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
  
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};


export { encrypt, decrypt };