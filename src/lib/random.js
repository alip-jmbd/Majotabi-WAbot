import fetch from 'node-fetch';

export const fetchRandom = async (endpoint) => {
    const url = `https://api.nefyu.my.id/api/random/${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Gagal mengambil gambar/gif');
    return Buffer.from(await response.arrayBuffer());
};