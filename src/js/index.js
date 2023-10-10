import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { fetchData, API_KEY, BASE_URL } from './api';
import { createMarkup } from './photoCardMarkup';

const selectors = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('[name="searchQuery"]'),
  gallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

let page = 1;
let loading = false;

const fetchDataAndUpdateGallery = async () => {
  const searchQuery = selectors.input.value.trim();

  if (!searchQuery && !loading) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  loading = true;

  const params = {
    key: API_KEY,
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  };

  try {
    const data = await fetchData(params);
    const newPhotosMarkup = createMarkup(data.hits);
    selectors.gallery.insertAdjacentHTML('beforeend', newPhotosMarkup);

    new SimpleLightbox('.gallery a', {
      close: true,
    });

    if (data.totalHits > 0) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      page++;
    } else {
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  } finally {
    loading = false;
  }
};

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fetchDataAndUpdateGallery();
      }
    });
  },
  {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  }
);

selectors.form.addEventListener('submit', event => {
  event.preventDefault();
  page = 1;
  selectors.gallery.innerHTML = '';
  fetchDataAndUpdateGallery();
});

observer.observe(selectors.guard);
