import fetch from 'node-fetch';

export const fetchWaifu = async (endpoint) => {
    const url = `https://api.nefyu.my.id/api/waifu-sfw/${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Gagal mengambil gambar');
    return Buffer.from(await response.arrayBuffer());
};