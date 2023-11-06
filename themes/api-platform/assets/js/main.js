function toggleClasses(elements, open, close, toggle) {
  ;[].slice.call(elements).forEach((el) => {
    const openClasses = el.dataset[open]?.split(' ') || []
    const closeClasses = el.dataset[close]?.split(' ') || []
    const update = (classes, op) => classes.forEach((c) => el.classList[op](c))

    if (toggle) {
      update(closeClasses, 'remove')
      update(openClasses, 'add')
    } else {
      update(openClasses, 'remove')
      update(closeClasses, 'add')
    }
  })
}

function ApiPlatform() {
  const state = {
    menu: false,
    sidebar: true,
  }

  const menuElements = document.querySelectorAll('[data-open]')
  function toggleMenu(event) {
    event.preventDefault()
    state.menu = !state.menu
    toggleClasses(menuElements, 'open', 'close', state.menu)
  }

  window.toggleMenu = toggleMenu

  const sidebarElements = document.querySelectorAll('[data-minimize]')
  function toggleSidebar(event) {
    event.preventDefault()
    state.sidebar = !state.sidebar
    toggleClasses(sidebarElements, 'maximize', 'minimize', state.sidebar)
  }

  window.toggleSidebar = toggleSidebar

  function toggleSidebarMenu(event) {
    event.preventDefault()
    const target = event.target.closest('.doc-nav')
    const id = target.dataset.identifier
    if (undefined === state[id]) {
			const isOpen = 1 === parseInt(target.dataset.isOpen || 0)
      state[id] = !isOpen	
    } else {
      state[id] = !state[id]
    }

    const elements = target.querySelectorAll('[data-menu-open]')
    toggleClasses(elements, 'menuOpen', 'menuClose', state[id])
  }

  window.toggleSidebarMenu = toggleSidebarMenu
}

ApiPlatform()
