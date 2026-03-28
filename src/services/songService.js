import axiosClient from './axiosClient';

const songService = {
    getAllSongs: () => {
        return axiosClient.get('/songs');
    }
};

export default songService;