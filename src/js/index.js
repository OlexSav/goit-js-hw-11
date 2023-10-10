import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { fetchData } from './api';
import { createMarkup } from './photoCardMarkup';

const selectors = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

let page = 1;
let searchQuery = null;
let isFirstLoad = true;
let isSubmit = true;

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadMoreData();
      }
    });
  },
  {
    root: null,
    rootMargin: '200px',
    threshold: 1,
  }
);

const fetchDataAndUpdateGallery = async () => {
  try {
    const data = await fetchData(searchQuery, page);
    const newPhotosMarkup = createMarkup(data.hits);
    selectors.gallery.insertAdjacentHTML('beforeend', newPhotosMarkup);

    new SimpleLightbox('.gallery a', {
      close: true,
    });

    if (data.totalHits > 0) {
      if (isSubmit) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
    } else {
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (data.totalHits < 40) return;

    observer.observe(selectors.guard);

    const lastPage = Math.ceil(data.totalHits / 40);

    if (lastPage === page) {
      observer.unobserve(selectors.guard);
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
};

const loadMoreData = () => {
  if (isFirstLoad) {
    return (isFirstLoad = false);
  }

  isSubmit = false;

  page += 1;

  fetchDataAndUpdateGallery();
};

const onSubmit = event => {
  event.preventDefault();

  isFirstLoad = true;
  isSubmit = true;

  searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  if (!searchQuery) return Notiflix.Notify.failure('Search is empty');

  page = 1;
  selectors.gallery.innerHTML = '';
  fetchDataAndUpdateGallery();
};

selectors.form.addEventListener('submit', onSubmit);
