import {getBlogPostURL} from '../utils/links';
import {getDuration} from '../utils/time';
import {News} from '../definitions';

export default class Newsmaker {
    static UPDATE_INTERVAL = getDuration({hours: 4});

    latest: News[];
    onUpdate: (news: News[]) => void;

    constructor(onUpdate: (news: News[]) => void) {
        this.latest = [];
        this.onUpdate = onUpdate;
    }

    subscribe() {
        this.updateNews();
        setInterval(() => this.updateNews(), Newsmaker.UPDATE_INTERVAL);
    }

    private async updateNews() {
        const news = await this.getNews();
        if (Array.isArray(news)) {
            this.latest = news;
            this.onUpdate(this.latest);
        }
    }

    private async getNews() {
        try {
            const response = await fetch(`https://darkreader.github.io/blog/posts.json?date=${(new Date()).toISOString().substring(0, 10)}`, {cache: 'no-cache'});
            const $news = await response.json();
            return new Promise<News[]>((resolve, reject) => {
                chrome.storage.sync.get({readNews: []}, ({readNews}) => {
                    const news: News[] = $news.map(({id, date, headline, important}) => {
                        const url = getBlogPostURL(id);
                        const read = this.isRead(id, readNews);
                        return {id, date, headline, url, important, read};
                    });
                    for (let i = 0; i < news.length; i++) {
                        const date = new Date(news[i].date);
                        if (isNaN(date.getTime())) {
                            reject(new Error(`Unable to parse date ${date}`));
                            return;
                        }
                    }
                    resolve(news);
                });
            });
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    markAsRead(...ids: string[]) {
        return new Promise((resolve) => {
            chrome.storage.sync.get({readNews: []}, ({readNews}) => {
                const results = readNews.slice();
                let changed = false;
                ids.forEach((id) => {
                    if (readNews.indexOf(id) < 0) {
                        results.push(id);
                        changed = true;
                    }
                });
                if (changed) {
                    this.latest = this.latest.map(({id, date, url, headline, important}) => {
                        const read = this.isRead(id, results);
                        return {id, date, url, headline, important, read};
                    });
                    this.onUpdate(this.latest);
                    chrome.storage.sync.set({readNews: results}, () => resolve());
                } else {
                    resolve();
                }
            });
        });
    }

    isRead(id: string, readNews: string[]) {
        return readNews.includes(id);
    }
}
