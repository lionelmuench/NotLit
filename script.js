document.addEventListener('DOMContentLoaded', function() {
    const fetchButton = document.getElementById('fetchButton');
    if (fetchButton) {
        fetchButton.addEventListener('click', fetchAndDisplayContent);
    }
});

function fetchAndDisplayContent() {
    var url = document.getElementById('urlInput').value;
    var proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);

    fetch(proxyUrl)
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const contentDisplay = document.getElementById('contentDisplay');
        contentDisplay.innerHTML = '';  // Clear previous content

        const bookName = getBookName(url);
        const summaries = doc.querySelectorAll('.summary-text.readable.highlightable-content.non-paywall');
        const analyses = doc.querySelectorAll('.analysis, .analysis.blur');  // Updated to include 'analysis' class

         // Create headers for the entire section
         const summaryHeader = document.createElement('h2');
         summaryHeader.textContent = 'Summary';
         summaryHeader.className = 'content-header';
         contentDisplay.appendChild(summaryHeader);
 
         const analysisHeader = document.createElement('h2');
         analysisHeader.textContent = 'Analysis';
         analysisHeader.className = 'content-header';
         contentDisplay.appendChild(analysisHeader);
         
        summaries.forEach((summary, index) => {
            const pairDiv = document.createElement('div');
            pairDiv.className = 'pair-container';

            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'content-block summary';
            summaryDiv.innerHTML = summary.innerHTML;

            const analysisDiv = document.createElement('div');
            analysisDiv.className = 'content-block analysis';

            if (analyses[index]) {
                removeUnwantedElements(analyses[index]);
                console.log('Customizing themes for analysis index:', index); // Debugging statement
                customizeActiveThemes(analyses[index], bookName);
                analysisDiv.innerHTML = analyses[index].innerHTML;
            }

            pairDiv.appendChild(summaryDiv);
            pairDiv.appendChild(analysisDiv);
            contentDisplay.appendChild(pairDiv);
        });
    })
    .catch(error => {
        console.error('Error fetching and parsing page:', error);
        document.getElementById('contentDisplay').innerHTML = '<p style="color:red;">Failed to load content.</p>';
    });
}

function getBookName(url) {
    const matches = url.match(/\/lit\/([^\/]+)\//);
    return matches ? matches[1] : null;
}

function removeUnwantedElements(elem) {
    elem.querySelectorAll('a').forEach(a => a.remove());
    elem.querySelectorAll('.active-quotes').forEach(element => element.remove());
}

function customizeActiveThemes(elem, bookName) {
    const activeThemesContainer = elem.querySelector('.active-themes');
    if (!activeThemesContainer) {
        console.log('No active themes container found'); // Debugging statement
        return;
    }

    elem.querySelectorAll('.active-themes .title').forEach(title => {
        title.classList.add('title');
    });

    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container';

    const icons = activeThemesContainer.querySelectorAll('img');
    icons.forEach(icon => {
        let themeName = getThemeNameFromIconURL(icon.src, bookName);
        const button = createThemeButton(themeName, bookName);
        if (button) {
            iconContainer.appendChild(button);
            console.log('Button created for theme:', themeName); // Debugging statement
        }
        icon.parentNode.removeChild(icon);  // Remove the icon after replacing it with a button
    });

    activeThemesContainer.appendChild(iconContainer);
}

function getThemeNameFromIconURL(url, bookName) {
    const regex = new RegExp(bookName + "-(.+?)\\.medium");
    const matches = url.match(regex);
    return matches ? matches[1].replace(/-/g, ' ') : null;
}

function createThemeButton(themeName, bookName) {
    if (!themeName) return null;

    let button = document.createElement('a');
    button.className = 'theme-button';
    button.href = `https://www.litcharts.com/lit/${bookName}/themes/${themeName.replace(/\s+/g, '-')}`;
    button.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1).replace(/-/g, ' ');  // Title case
    button.target = "_blank";
    return button;
}
