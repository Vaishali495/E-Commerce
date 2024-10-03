const eyeIcon = document.querySelector('.ri-eye-line');
const eyeOffIcon = document.querySelector('.ri-eye-off-line');
const passwordInput = document.getElementById('password');

eyeIcon.addEventListener('click',(event) => {
    console.log("event =",event.target);
    passwordInput.type = 'text';
    eyeIcon.classList.add('hidden');
    eyeOffIcon.classList.remove('hidden');
})

eyeOffIcon.addEventListener('click', function () {
    passwordInput.type = 'password';
    eyeIcon.classList.remove('hidden');
    eyeOffIcon.classList.add('hidden');
});