import axiosInstance from './axiosInstance';

export const getPublicKey = async (userId: number) => {
  const response = await axiosInstance.get(`/user-public-key/${userId}`);
  return response.data.publicKey;
};

export const updatePublicKey = async (publicKey: string) => {
  const response = await axiosInstance.post('/user-public-key', { public_key: publicKey });
  return response.data.publicKey;
};
