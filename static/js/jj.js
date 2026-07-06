const bar = document.querySelector('.bar');

bar.addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('hidden');
});
