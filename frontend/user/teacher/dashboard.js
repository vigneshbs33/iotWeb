document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('greetingHeader').innerHTML = 'Welcome, ' + sessionStorage.getItem('username') + '!'
})