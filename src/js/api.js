import axios from 'axios';

export const BASE_URL = 'https://pixabay.com/api/';
export const API_KEY = '39919793-dad2b3274de4bb229f12dd21a';

export async function fetchData(params) {
  try {
    const response = await axios.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    Notiflix.Notify.failure(
      'An error occurred while fetching data. Please try again later.'
    );
  }
}
