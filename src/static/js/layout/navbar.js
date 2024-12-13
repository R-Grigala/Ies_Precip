document.addEventListener("DOMContentLoaded", function() {
    const navLinksStart = document.getElementById('navLinksStart');
    const navLinksEnd = document.getElementById('navLinksEnd');
    
    // Define static navigation items
    const navItems = [
        { endpoint: '/', text: 'მთავარი' },
        // Add other static links as needed
    ];

    // Define the login and registration links
    const authLinks = [
        { endpoint: '/login', text: 'შესვლა' }
    ];

    // Get the current path
    const currentPath = window.location.pathname;

    // Add static navigation items to the start of the navbar
    navItems.forEach(item => {
        const link = document.createElement('a');
        link.href = item.endpoint;
        link.className = currentPath === item.endpoint ? 'btn btn-sm btn-info m-2' : 'btn btn-sm btn-primary m-2';
        link.textContent = item.text;

        const listItem = document.createElement('li');
        listItem.className = 'd-flex justify-content-center';
        listItem.appendChild(link);

        navLinksStart.appendChild(listItem);
    });

    // Check for access_token in localStorage and update the navigation
    if (localStorage.getItem('access_token')) {
        // User is logged in, show Logout button
        const logoutItem = document.createElement('li');
        logoutItem.className = 'd-flex justify-content-center';

        const logoutLink = document.createElement('a');
        logoutLink.href = '/login';
        logoutLink.className = 'btn btn-sm btn-danger m-2';
        logoutLink.textContent = 'გასვლა';
        logoutLink.onclick = function() {
            clearSessionData();
        };

        logoutItem.appendChild(logoutLink);
        navLinksEnd.appendChild(logoutItem);

    } else {
        // User is not logged in, show Login and Registration buttons
        authLinks.forEach(link => {
            const authItem = document.createElement('li');
            authItem.className = 'd-flex justify-content-center';

            const authLink = document.createElement('a');
            authLink.href = link.endpoint;
            authLink.className = currentPath === link.endpoint ? 'btn btn-sm btn-info m-2' : 'btn btn-sm btn-primary m-2';
            authLink.textContent = link.text;

            authItem.appendChild(authLink);
            navLinksEnd.appendChild(authItem);
        });
    }
});