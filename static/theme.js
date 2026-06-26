// Immediate execution to prevent flash of light theme
(function() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Sync body class
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // Determine target container for the toggle button
    const nav = document.querySelector('.nav');
    let container;

    if (nav) {
        let navActions = nav.querySelector('.nav-actions');
        if (!navActions) {
            navActions = document.createElement('div');
            navActions.className = 'nav-actions';
            // Move logout link if exists
            const logoutLink = nav.querySelector('a[href*="logout"]');
            if (logoutLink) {
                logoutLink.parentNode.insertBefore(navActions, logoutLink);
                navActions.appendChild(logoutLink);
            } else {
                nav.appendChild(navActions);
            }
        }
        container = navActions;
    } else {
        // Floating toggle for pages without navbar (e.g., login, signup, index)
        const floating = document.createElement('div');
        floating.className = 'floating-theme-container';
        floating.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000;';
        document.body.appendChild(floating);
        container = floating;
    }

    // Create the theme toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle-btn';
    if (!nav) {
        toggleBtn.style.cssText = 'background: var(--card-bg); color: var(--text-color); border: 1px solid var(--border-color); box-shadow: var(--shadow); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: var(--transition);';
        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.transform = 'scale(1.1) rotate(15deg)';
            toggleBtn.style.boxShadow = 'var(--shadow-hover)';
        });
        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.transform = 'scale(1) rotate(0)';
            toggleBtn.style.boxShadow = 'var(--shadow)';
        });
    }
    toggleBtn.type = 'button';
    toggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    toggleBtn.title = 'Смяна на темата';

    toggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        if (isDark) {
            document.body.classList.remove('dark-theme');
            document.documentElement.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
            toggleBtn.innerHTML = '🌙';
        } else {
            document.body.classList.add('dark-theme');
            document.documentElement.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            toggleBtn.innerHTML = '☀️';
        }
    });

    // Insert theme toggle button
    if (container.firstChild) {
        container.insertBefore(toggleBtn, container.firstChild);
    } else {
        container.appendChild(toggleBtn);
    }

    // Notifications Bell logic
    if (nav) {
        const bellContainer = document.createElement('div');
        bellContainer.className = 'notif-bell-container';
        bellContainer.style.cssText = 'position: relative; margin-right: 10px;';
        
        const bellBtn = document.createElement('button');
        bellBtn.className = 'theme-toggle-btn notif-bell-btn';
        bellBtn.type = 'button';
        bellBtn.innerHTML = '🔔 <span class="notif-badge" style="display: none; position: absolute; top: -5px; right: -5px; background: var(--danger-color); color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; font-weight: bold; border: 2px solid var(--nav-bg);">0</span>';
        bellContainer.appendChild(bellBtn);
        
        const dropdown = document.createElement('div');
        dropdown.className = 'notif-dropdown';
        dropdown.style.cssText = 'position: absolute; top: 45px; right: 0; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: var(--shadow-hover); width: 320px; max-height: 400px; overflow-y: auto; z-index: 1000; display: none;';
        dropdown.innerHTML = `
            <div class="notif-header" style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-weight: bold; display: flex; justify-content: space-between; align-items: center; color: var(--text-color);">
                <span>Известия</span>
                <button type="button" class="notif-clear-btn" id="mark-all-read" style="background: none; border: none; color: var(--primary-color); cursor: pointer; font-weight: 600; font-size: 0.8rem;">Прочети всички</button>
            </div>
            <div class="notif-list-container" style="max-height: 300px; overflow-y: auto;">
                <div class="notif-item" style="padding: 12px 16px; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">Няма известия</div>
            </div>
        `;
        bellContainer.appendChild(dropdown);
        
        // Insert before logout or at the beginning of nav-actions
        if (container.firstChild) {
            container.insertBefore(bellContainer, container.firstChild);
        } else {
            container.appendChild(bellContainer);
        }
        
        const badge = bellBtn.querySelector('.notif-badge');
        const listContainer = dropdown.querySelector('.notif-list-container');
        const markAllReadBtn = dropdown.querySelector('#mark-all-read');
        
        async function fetchNotifications() {
            try {
                const response = await fetch('/api/notifications');
                if (response.status === 401) return;
                const notifications = await response.json();
                
                const unreadCount = notifications.filter(n => !n.is_read).length;
                if (unreadCount > 0) {
                    badge.textContent = unreadCount;
                    badge.style.display = 'inline';
                } else {
                    badge.style.display = 'none';
                }
                
                if (notifications.length === 0) {
                    listContainer.innerHTML = '<div class="notif-item" style="padding: 12px 16px; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">Няма известия</div>';
                } else {
                    listContainer.innerHTML = notifications.map(n => `
                        <div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}" style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; transition: var(--transition); color: var(--text-color); ${n.is_read ? '' : 'background: rgba(59, 130, 246, 0.08); font-weight: 500;'}">
                            <div>${n.message}</div>
                            <small style="color: var(--text-secondary); font-size: 10px; display: block; margin-top: 5px;">⏰ ${n.created_at}</small>
                        </div>
                    `).join('');
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        }
        
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.style.display === 'block';
            dropdown.style.display = isOpen ? 'none' : 'block';
            if (!isOpen) {
                fetchNotifications();
            }
        });
        
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });
        
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        markAllReadBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/notifications/read', { method: 'POST' });
                if (res.ok) {
                    fetchNotifications();
                }
            } catch (err) {
                console.error(err);
            }
        });
        
        // Poll for notifications
        fetchNotifications();
        setInterval(fetchNotifications, 10000);
    }
});
