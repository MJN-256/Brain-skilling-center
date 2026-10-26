const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav-links');

if (menuToggle && navigation) {
    const closeMenu = () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
        navigation.classList.remove('is-open');
    };

    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        menuToggle.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
        navigation.classList.toggle('is-open', !isExpanded);
    });

    navigation.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeMenu();
            menuToggle.focus();
        }
    });
}

const currentYear = document.querySelector('#current-year');
if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
}

const uniformPhotos = [
    '20261022_153008.jpg',
    '20261022_153144.jpg',
    '20261022_153202.jpg',
    '20261022_153219.jpg',
    '20261022_153229.jpg',
    '20261022_153233.jpg',
    '20261022_153237.jpg',
];
const uniformPhotoPath = filename => `photos%20and%20other/uniform/${filename}`;
const heroBackgrounds = [
    document.querySelector('#hero-background-one'),
    document.querySelector('#hero-background-two')
];
const backgroundMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (heroBackgrounds.every(image => image instanceof HTMLImageElement) && uniformPhotos.length > 0) {
    let backgroundIndex = 0;
    let visibleBackground = 0;
    let backgroundTimer;

    heroBackgrounds[visibleBackground].src = uniformPhotoPath(uniformPhotos[backgroundIndex]);

    const stopBackgroundSlideshow = () => {
        window.clearInterval(backgroundTimer);
        backgroundTimer = undefined;
    };

    const startBackgroundSlideshow = () => {
        stopBackgroundSlideshow();
        if (backgroundMotion.matches || document.hidden) {
            return;
        }

        backgroundTimer = window.setInterval(() => {
            const nextBackground = 1 - visibleBackground;
            backgroundIndex = (backgroundIndex + 1) % uniformPhotos.length;
            heroBackgrounds[nextBackground].src = uniformPhotoPath(uniformPhotos[backgroundIndex]);
            heroBackgrounds[nextBackground].classList.add('is-visible');
            heroBackgrounds[visibleBackground].classList.remove('is-visible');
            visibleBackground = nextBackground;
        }, 2800);
    };

    document.addEventListener('visibilitychange', startBackgroundSlideshow);
    backgroundMotion.addEventListener('change', startBackgroundSlideshow);
    startBackgroundSlideshow();
}

const photoGrid = document.querySelector('#photo-grid');
const photoCarousel = document.querySelector('#photo-carousel');
const photoStatus = document.querySelector('#photo-status');
const previousButton = document.querySelector('#photo-previous');
const nextButton = document.querySelector('#photo-next');
const pauseButton = document.querySelector('#photo-pause');
const photoDialog = document.querySelector('#photo-dialog');
const expandedPhoto = document.querySelector('#expanded-photo');
const expandedCaption = document.querySelector('#expanded-caption');
const closeDialogButton = document.querySelector('#photo-dialog-close');
const dialogPreviousButton = document.querySelector('#dialog-previous');
const dialogNextButton = document.querySelector('#dialog-next');
const photos = photoGrid ? Array.from(photoGrid.querySelectorAll('.photo-card')) : [];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const slideshowDelay = 2200;

if (
    photoGrid && photoCarousel && photoStatus && previousButton && nextButton &&
    pauseButton && photoDialog instanceof HTMLDialogElement && expandedPhoto &&
    expandedCaption && closeDialogButton && dialogPreviousButton && dialogNextButton &&
    photos.length > 0
) {
    let currentPhotoIndex = 0;
    let slideshowTimer;
    let manuallyPaused = reducedMotion.matches;
    let resumeAfterDialog = false;
    let lastPhotoTrigger;
    let expandedPhotoIndex = 0;
    const photosPerSlide = 4;

    uniformPhotos.forEach((filename, index) => {
        const figure = document.createElement('figure');
        const image = document.createElement('img');
        const caption = document.createElement('figcaption');
        figure.className = 'photo-card';
        image.src = uniformPhotoPath(filename);
        image.alt = 'Student wearing a uniform at Brain Skilling Center';
        image.loading = 'lazy';
        caption.textContent = `Uniform photo ${index + 1}`;
        figure.append(image, caption);
        photoGrid.append(figure);
        photos.push(figure);
    });

    photoCarousel.classList.add('is-enhanced');

    const showPhoto = index => {
        currentPhotoIndex = (index + photos.length) % photos.length;
        const firstVisibleIndex = Math.floor(currentPhotoIndex / photosPerSlide) * photosPerSlide;
        currentPhotoIndex = firstVisibleIndex;
        photos.forEach((photo, photoIndex) => {
            const isActive = photoIndex >= firstVisibleIndex && photoIndex < firstVisibleIndex + photosPerSlide;
            photo.classList.toggle('is-active', isActive);
            photo.setAttribute('aria-hidden', String(!isActive));
        });
        const lastVisibleIndex = Math.min(firstVisibleIndex + photosPerSlide, photos.length);
        photoStatus.textContent = `Photos ${firstVisibleIndex + 1}-${lastVisibleIndex} of ${photos.length}`;
    };

    const showExpandedPhoto = index => {
        expandedPhotoIndex = (index + photos.length) % photos.length;
        const photo = photos[expandedPhotoIndex];
        const image = photo.querySelector('img');
        const caption = photo.querySelector('figcaption');
        if (image && caption) {
            expandedPhoto.src = image.src;
            expandedPhoto.alt = image.alt;
            expandedCaption.textContent = caption.textContent;
        }
    };

    const stopSlideshow = () => {
        window.clearInterval(slideshowTimer);
        slideshowTimer = undefined;
    };

    const startSlideshow = () => {
        stopSlideshow();
        if (
            !manuallyPaused && !photoDialog.open && !document.hidden &&
            !photoCarousel.matches(':hover, :focus-within')
        ) {
            slideshowTimer = window.setInterval(() => showPhoto(currentPhotoIndex + photosPerSlide), slideshowDelay);
        }
        pauseButton.textContent = manuallyPaused ? 'Play slideshow' : 'Pause slideshow';
        pauseButton.setAttribute('aria-pressed', String(manuallyPaused));
    };

    function openPhotoDialog(trigger, photoIndex) {
        lastPhotoTrigger = trigger;
        showExpandedPhoto(photoIndex);
        resumeAfterDialog = !manuallyPaused;
        stopSlideshow();
        photoDialog.showModal();
        closeDialogButton.focus();
    }

    const closePhotoDialog = () => {
        if (photoDialog.open) {
            photoDialog.close();
        }
    };

    const movePhoto = direction => {
        if (photoDialog.open) {
            showExpandedPhoto(expandedPhotoIndex + direction);
            showPhoto(expandedPhotoIndex);
        } else {
            const slideCount = Math.ceil(photos.length / photosPerSlide);
            const currentSlide = Math.floor(currentPhotoIndex / photosPerSlide);
            const nextSlide = (currentSlide + direction + slideCount) % slideCount;
            showPhoto(nextSlide * photosPerSlide);
        }
    };
    previousButton.addEventListener('click', () => movePhoto(-1));
    nextButton.addEventListener('click', () => movePhoto(1));
    dialogPreviousButton.addEventListener('click', () => movePhoto(-1));
    dialogNextButton.addEventListener('click', () => movePhoto(1));
    closeDialogButton.addEventListener('click', closePhotoDialog);
    photoDialog.addEventListener('click', event => {
        if (event.target === photoDialog) {
            closePhotoDialog();
        }
    });
    photoDialog.addEventListener('close', () => {
        if (lastPhotoTrigger?.isConnected) {
            lastPhotoTrigger.focus();
        }
        if (resumeAfterDialog) {
            manuallyPaused = false;
            startSlideshow();
        }
    });
    photoDialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            movePhoto(-1);
        } else if (event.key === 'ArrowRight') {
            movePhoto(1);
        }
    });
    pauseButton.addEventListener('click', () => {
        manuallyPaused = !manuallyPaused;
        startSlideshow();
    });
    photoCarousel.addEventListener('mouseenter', stopSlideshow);
    photoCarousel.addEventListener('mouseleave', startSlideshow);
    photoCarousel.addEventListener('focusin', stopSlideshow);
    photoCarousel.addEventListener('focusout', event => {
        if (!photoCarousel.contains(event.relatedTarget)) {
            startSlideshow();
        }
    });
    document.addEventListener('visibilitychange', startSlideshow);
    reducedMotion.addEventListener('change', event => {
        if (event.matches) {
            manuallyPaused = true;
        }
        startSlideshow();
    });

    photos.forEach(photo => {
        const image = photo.querySelector('img');
        const caption = photo.querySelector('figcaption');
        if (image && caption) {
            const imageButton = document.createElement('button');
            imageButton.type = 'button';
            imageButton.setAttribute('aria-label', `Maximize photo: ${caption.textContent?.trim() || image.alt}`);
            imageButton.append(image);
            photo.insertBefore(imageButton, caption);
            imageButton.addEventListener('click', () => openPhotoDialog(imageButton, photos.indexOf(photo)));
        }
    });

    showPhoto(0);
    startSlideshow();
}
