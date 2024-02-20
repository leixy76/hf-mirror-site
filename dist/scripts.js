function searchModel() {
    const keyword = document.getElementById('searchKeyword').value.trim();
    if (keyword) {
        const domain = window.location.hostname;
        const url = `https://${domain}/models?search=${encodeURIComponent(keyword)}`;
        window.location.href = url;
    }
}

let isDropdownNavigationActive = false;
document.getElementById('searchKeyword').addEventListener('keypress', function (event) {
    if (event.keyCode === 13) {
        event.preventDefault(); // Prevent the default Enter key behavior
        if (!isDropdownNavigationActive) {
            searchModel(); // Only call searchModel if not navigating dropdown
        } else {
            // Logic to trigger a click on the highlighted dropdown item
            // You will need to keep track of which item is currently highlighted
            // and programmatically click it.
            // Example:
            // document.querySelector('.search-result-item.highlighted').click();
            const items = document.querySelectorAll('.search-result-item');
            if (selectedIndex > -1) {
                items[selectedIndex].click();
            }
        }
        isDropdownNavigationActive = false; // Reset the flag after action
    }
});
let debounceTimer;
const searchInput = document.getElementById('searchKeyword');
const searchResults = document.getElementById('searchResults');
let abortController; // variable to hold the abort controller

searchInput.addEventListener('input', function () {
    selectedIndex = -1;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async function () {
        const query = searchInput.value.trim();
        if (query) {
            // cancel the previous request
            if (abortController) {
                abortController.abort();
            }

            // create a new abort controller
            abortController = new AbortController();
            sessionStorage.setItem('searchKeyword', query);
            try {
                const response = await fetch(`https://hf-mirror.com/api/quicksearch?q=${encodeURIComponent(query)}&type=model&type=dataset`, { signal: abortController.signal });
                const data = await response.json();
                let resultsHtml = '';
                ['models', 'datasets'].forEach(type => {
                    if (data[type]) {
                        resultsHtml += `<div class="search-result-type"><strong>${type}</strong></div>`;
                        data[type].forEach(item => {
                            resultsHtml += `<div class="search-result-item" onclick="openLink('/${type === 'models' ? '' : type + '/'}${item.id}')">${item.id}</div>`;
                        });
                    }
                });
                searchResults.innerHTML = resultsHtml;
                searchResults.style.display = 'block';
                // sessionStorage.setItem('searchResults', searchResults.innerHTML);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // request was aborted, do nothing
                } else {
                    // handle other errors
                    console.error(error);
                }
            }
        } else {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
        }
    }, 300);
});

searchInput.addEventListener('focus', function () {
    if (searchInput.value.trim()) {
        searchResults.style.display = 'block';
    }
});

searchInput.addEventListener('blur', function () {
    setTimeout(function () {
        searchResults.style.display = 'none';
    }, 300);
});

function openLink(url) {
    // const itemId = url.split('/').pop();
    // searchInput.value = itemId; // update the search input value
    window.location.href = url;
}

function copyCode(btn) {
    const code = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = 'Copy';
        }, 2000);
    });
}



document.addEventListener("DOMContentLoaded", function () {
    const donateArea = document.querySelector('.donate');
    const qrcode = document.querySelector('.qrcode');

    // Detect if the user is on a mobile device
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // On mobile, show QR code on click
        donateArea.addEventListener('click', function () {
            qrcode.classList.toggle('show-qrcode');
        });
    } else {
        // On PC, show QR code on hover is handled by CSS
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const donateArea = document.querySelector('.groups');
    const qrcode = document.querySelector('.groups_qrcode');

    // Detect if the user is on a mobile device
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // On mobile, show QR code on click
        donateArea.addEventListener('click', function () {
            qrcode.classList.toggle('show-qrcode');
        });
    } else {
        // On PC, show QR code on hover is handled by CSS
    }
});

let selectedIndex = -1; // variable to keep track of the selected item index

searchInput.addEventListener('keydown', function (event) {
    const items = document.querySelectorAll('.search-result-item');
    if (event.key === 'ArrowDown') {
        isDropdownNavigationActive = true;
        // down arrow key
        if (selectedIndex < items.length - 1) {
            selectedIndex++;
            items[selectedIndex].classList.add('selected');
            if (selectedIndex > 0) {
                items[selectedIndex - 1].classList.remove('selected');
            }
        }
    } else if (event.key === 'ArrowUp') {
        isDropdownNavigationActive = true;
        // up arrow key
        if (selectedIndex > 0) {
            selectedIndex--;
            items[selectedIndex].classList.add('selected');
            items[selectedIndex + 1].classList.remove('selected');
        }
    } else if (event.key === 'Enter') {
        // enter key
        if (selectedIndex > -1) {
            items[selectedIndex].click();
        }
    }
});


window.addEventListener('pageshow', function () {
    const storedKeyword = sessionStorage.getItem('searchKeyword');
    if (storedKeyword !== null) {
        // searchInput.focus();
        searchInput.value = storedKeyword;
        // const storedResults = sessionStorage.getItem('searchResults');
        // if (storedResults) {
        //     searchResults.innerHTML = storedResults;
        //     searchResults.style.display = 'block';
        // }
    }
});
// 定义一个配置对象
const config = {
    models: {
        url: "https://hf-mirror.com/models-json?sort=trending",
        containerSelector: '.models ul',
        itemTemplate: (item) => `
            <span class="model-id">${item.id}</span>
            <div class="model-info">
                <span class="model-downloads">⬇️${item.downloads}</span>
                <span class="model-likes">❤️${item.likes}</span>
            </div>
        `
    },
    datasets: {
        url: "https://hf-mirror.com/models-json?sort=trending",
        containerSelector: '.dataset ul',
        itemTemplate: (item) => `
            <span class="model-id">${item.id}</span>
            <div class="model-info">
                <span class="model-downloads">⬇️${item.downloads}</span>
                <span class="model-likes">❤️${item.likes}</span>
            </div>
        `
    }
};

// 封装获取和渲染列表的函数，添加limit参数来限制项目数量
function fetchAndRenderList({ url, containerSelector, itemTemplate }, limit = 10) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const items = data["models"]; // 根据实际情况可能需要调整以适配数据结构
            if (!items || !Array.isArray(items)) {
                throw new Error('Invalid data format');
            }
            const container = document.querySelector(containerSelector);
            if (!container) {
                throw new Error('List container element not found');
            }
            container.innerHTML = ''; // 清空容器
            items.slice(0, limit).forEach(item => { // 只渲染前limit项
                const li = document.createElement('li');
                li.innerHTML = itemTemplate(item);
                container.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function timeAgo(date) {
    const now = new Date();
    const updatedDate = new Date(date);
    const diffTime = Math.abs(now - updatedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 60) {
        return `${diffDays}天前更新`;
    } else {
        // 获取年、月、日，并确保月和日为两位数格式
        const year = updatedDate.getFullYear();
        let month = updatedDate.getMonth() + 1; // getMonth() 从 0 开始
        let day = updatedDate.getDate();

        // 将月份和日期格式化为两位数
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;

        // 组合成 YYYY-MM-DD 格式的字符串
        return `${year}-${month}-${day}更新`;
    }
}

function abbreviateNumber(num) {
    if (num >= 1000000) { // For numbers >= 1,000,000
        return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) { // For numbers >= 1,000
        return `${(num / 1000).toFixed(1)}k`;
    } else {
        return num; // For numbers < 1,000
    }
}


document.addEventListener('DOMContentLoaded', function () {
    let maxItemsToShow;
    const screenWidth = window.innerWidth;

    if (screenWidth < 768) {
        maxItemsToShow = 3; 
    } else {
        maxItemsToShow = 10;
    }

    let isExpanded = screenWidth >= 700; // 大屏幕默认为展开状态，无需展开按钮

    async function fetchTrending(type) {
        const response = await fetch(`https://hf-mirror.com/api/trending?limit=10&type=${type}`);
        const data = await response.json();
        const container = document.getElementById('trendingItems');
        container.innerHTML = ''; // 清除之前的内容
        let isExpanded = false; // 跟踪展开状态

        data.recentlyTrending.forEach((item, index) => {
            const element = document.createElement('div');
            element.className = 'trending-item';
            if (index >= maxItemsToShow) element.classList.add('hidden-item'); // 默认隐藏超过前三项的元素
            // 构造元素的HTML内容, 这里简化表示
            const modelName = item.repoData.id; // Assuming 'id' format is 'author/modelName'
            const pipeline_tag = item.repoData.pipeline_tag;
            const pipelineTagHTML = pipeline_tag ? `<div class="pipeline-tag">${pipeline_tag}</div>` : '';
            const downloadCountHTML = item.repoData.downloads ? `<span class="count">${abbreviateNumber(item.repoData.downloads)}</span>` : `<span class="count">-</span>`;
            element.innerHTML = `
                        <div class="item-rank">#${index + 1}</div>
                        <img src="${item.repoData.authorData.avatarUrl}" alt="${item.repoData.author}">
                        <div class="item-info">
                            <div class="model-name">${modelName}</div>
                            
                            <div class="stats-line">
                                ${pipelineTagHTML}
                                <div class="other-stats">
                                    <div class="stats-detail">
                                        <span>${timeAgo(item.repoData.lastModified)}</span>
                                    </div>
                                    <div class="stats-icons">
                                        <span class="downloads">
                                            <span class="svg-placeholder"><svg class="flex-none w-3 text-gray-400 mr-0.5" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" role="img" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z"></path></svg></span>
                                            ${downloadCountHTML}
                                        </span>
                                        <span class="likes">
                                            <span class="svg-placeholder"><svg class="flex-none w-3 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32" fill="currentColor"><path d="M22.45,6a5.47,5.47,0,0,1,3.91,1.64,5.7,5.7,0,0,1,0,8L16,26.13,5.64,15.64a5.7,5.7,0,0,1,0-8,5.48,5.48,0,0,1,7.82,0L16,10.24l2.53-2.58A5.44,5.44,0,0,1,22.45,6m0-2a7.47,7.47,0,0,0-5.34,2.24L16,7.36,14.89,6.24a7.49,7.49,0,0,0-10.68,0,7.72,7.72,0,0,0,0,10.82L16,29,27.79,17.06a7.72,7.72,0,0,0,0-10.82A7.49,7.49,0,0,0,22.45,4Z"></path></svg></span>
                                            <span class="count">${abbreviateNumber(item.likes)}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
            container.appendChild(element);
        });
        const toggleButton = document.getElementById('toggleButton');
        toggleButton.classList.toggle('hidden', isExpanded); // 大屏幕隐藏展开按钮
        toggleButton.innerText = '展开全部';
    }

    document.getElementById('toggleButton').addEventListener('click', function () {
        isExpanded = !isExpanded;
        document.querySelectorAll('.trending-item').forEach((item, index) => {
            if (index >= maxItemsToShow) {
                item.classList.toggle('hidden-item', !isExpanded);
            }
        });
        this.innerText = isExpanded ? '折叠' : '展开全部';
    });

    

    fetchTrending('all');
    const firstTab = document.querySelector('.tab');
    if (firstTab) {
        firstTab.classList.add('active');
        // 可以在这里调用fetchTrending，以加载第一个tab对应的内容
        const type = firstTab.getAttribute('data-type');
        fetchTrending(type);
    }
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            console.log(`${this.classList}`);
            if (this.classList.contains('active')) {
                return;
            }
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 根据tab的不同调用fetchTrending函数
            const type = this.getAttribute('data-type');
            fetchTrending(type);
        });
    });
});


let isExpanded = false; // 跟踪展开状态

// 根据当前屏幕宽度确定展示的项目数量和是否需要展开按钮
function adjustDisplayBasedOnWidth() {
    const screenWidth = window.innerWidth;
    let maxItemsToShow;

    if (screenWidth < 768) {
        maxItemsToShow = 3; // 小屏显示3项
        isExpanded = false;
    } else {
        maxItemsToShow = 10; // 大屏显示12项
        isExpanded = true; // 大屏幕时自动展开
    }

    // 更新展开按钮的显示状态
    const toggleButton = document.getElementById('toggleButton');
    toggleButton.style.display = isExpanded ? 'none' : 'block';

    // 根据maxItemsToShow更新显示的项目
    const items = document.querySelectorAll('.trending-item');
    items.forEach((item, index) => {
        if (index < maxItemsToShow || isExpanded) {
            item.classList.remove('hidden-item');
        } else {
            item.classList.add('hidden-item');
        }
    });

    // 更新展开/折叠按钮文本
    toggleButton.innerText = isExpanded ? '折叠' : '展开全部';
}

// 初始化和调整窗口大小时调用
document.addEventListener('DOMContentLoaded', adjustDisplayBasedOnWidth);
window.addEventListener('resize', adjustDisplayBasedOnWidth);

// 展开/折叠按钮事件监听器
document.getElementById('toggleButton').addEventListener('click', function() {
    isExpanded = !isExpanded;
    adjustDisplayBasedOnWidth(); // 重新调整界面
});