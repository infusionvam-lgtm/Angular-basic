import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalConstants, Login } from '../models';
import { CustomCookieService } from './cookie.service';
import { HttpService } from './http.service';

@Injectable()
export class AuthService {

    loggedInUser: any;
    username: any;
    constructor(
        private router: Router,
        private customCookieService: CustomCookieService,
        private httpService: HttpService
    ) {
        this.loggedInUser = this.getUser();
        this.username = 'rest'
    }

    get isLoggedIn(): boolean {
        const token = this.getToken();
        const user = this.getUser();
        return (token !== undefined && token !== '' && token !== null && user !== undefined && user !== null && user !== '');
    }

    getToken() {
        return localStorage.getItem(GlobalConstants.CookieKeys.Token);
    }

    getUser() {
        return localStorage.getItem(GlobalConstants.CookieKeys.User);
    }

    getProperties() {
        return localStorage.getItem(GlobalConstants.CookieKeys.Properties);
    }

    getReviewData(propertyName: string) {
        return localStorage.getItem(propertyName);
    }

    getTopicData(key: string) {
        return localStorage.getItem(key + '_topics');
    }

    getMultipleTopicData(key: string) {
        return localStorage.getItem(key + '_multipletopics');
    }

    getTotalTopicData() {
        return localStorage.getItem('total_topic');
    }

    getTotalTopicAttribution() {
        return localStorage.getItem('total_attributions');
    }

    getAttributionData(key: string) {
        return localStorage.getItem(key + '_attributions');
    }

    getMultipleAttributionData(key: string){
        return localStorage.getItem(key + '_multipleattributions');
    }

    getTotalAttributionData(key: string) {
        return localStorage.getItem(key + '_total');
    }

    getEntityData(propertyName: string) {
        return localStorage.getItem(propertyName + "_entities");
    }

    saveToken(token: string, expirationHours?: number | Date) {
        this.customCookieService.createCookie(GlobalConstants.CookieKeys.Token, token, expirationHours);
        localStorage.setItem(GlobalConstants.CookieKeys.Token, token);
    }

    saveUser(user: any) {
        let totalTopics = []
        let attributions = [];
        if (user.properties) {
            let properties = user.properties.map((property) => {
                property.label = property.propertyName;
                property.value = property.uuid;
                const topics = property.topics;
                topics && topics.length > 0 && topics.map((topic) => totalTopics.push(topic.key))
                this.saveTopicData(property.label, topics);

                topics && topics.length > 0 && topics.map((topic) => {
                    if (topic.values) {
                        const attr_values = topic.values.split(",");
                        attr_values.map((value) => {
                            attributions.push(value);
                        })
                    }
                });
                delete property.topics;
                return property;
            });
            this.saveTotalTopicData('total_topic', [...new Set(totalTopics)]);
            this.saveTotalAttributionsData('total_attributions', [...new Set(attributions)]);
            delete user.properties;
            localStorage.setItem(GlobalConstants.CookieKeys.Properties, JSON.stringify(properties));
        }
        localStorage.setItem(GlobalConstants.CookieKeys.User, JSON.stringify(user));
    }

    saveTopicData(propertyName: string, topics: any) {
        localStorage.setItem(propertyName + '_topics', JSON.stringify(topics.map((topic) => topic.key)));
        const attributions = [];
        topics.map((topic) => {
            if (topic.values) {
                const attr_values = topic.values.split(",");
                this.saveAttributionData(propertyName + topic.key + '_attributions', topic.values.split(","));
                attr_values.map((value) => {
                    attributions.push(value);
                })
            }
        });
        this.saveTotalAttributionData(propertyName + '_total', [...new Set(attributions)]);
    }

    saveTopicDataForMultiple(selectedList: any[], topics: any[]) {
        if (!Array.isArray(selectedList) || selectedList.length === 0) {
            console.warn("No selected properties found");
            return;
        }

        let allTopics: string[] = [];
        let allAttributions: string[] = [];

        selectedList.forEach((property) => {
            const propertyName = property.label || property.name || property.value || property.uuid;
            if (!propertyName) return;

            const topicKeys = topics.map((topic: any) => topic.key);
            localStorage.setItem(propertyName + "_multipletopics",JSON.stringify(topicKeys));

            let propertyAttributions: string[] = [];

            topics.forEach((topic: any) => {
                if (topic.values) {
                        const attrValues = topic.values.split(",");
                        localStorage.setItem(propertyName + topic.key + "_multipleattributions",JSON.stringify(attrValues));
                        propertyAttributions.push(...attrValues);
                    }
            });

            const uniquePropertyAttrs = [...new Set(propertyAttributions)];
            localStorage.setItem(propertyName + "_multipleattributions",JSON.stringify(uniquePropertyAttrs));

            allTopics.push(...topicKeys);
            allAttributions.push(...uniquePropertyAttrs);

        });

        const uniqueAllTopics = [...new Set(allTopics)];
        const uniqueAllAttributions = [...new Set(allAttributions)];

        localStorage.setItem("combined_multipletopics",JSON.stringify(uniqueAllTopics));
        localStorage.setItem("combined_multipleattributions",JSON.stringify(uniqueAllAttributions));
    }


    saveMultipleTopicData(key: string, topics: any[]) {
        localStorage.setItem(key + '_multipletopics', JSON.stringify(topics));
        }

    saveMultipleAttributionData(key: string, attributions: any[]) {
        localStorage.setItem(key + '_multipleattributions', JSON.stringify(attributions));
        }
    saveAttributionData(topic: string, attribution: any) {
        localStorage.setItem(topic, JSON.stringify(attribution));
    }

    saveTotalTopicData(key: string, attributions: any) {
        localStorage.setItem(key, JSON.stringify(attributions));
    }

    saveTotalAttributionsData(key: string, attributions: any) {
        localStorage.setItem(key, JSON.stringify(attributions));
    }

    saveTotalAttributionData(key: string, attributions: any) {
        localStorage.setItem(key, JSON.stringify(attributions));
    }

    saveReviewData(propertyName: string, reviews: any) {
        localStorage.setItem(propertyName, JSON.stringify(reviews));
    }

    saveEntityData(propertyName: string, entities: any) {
        localStorage.setItem(propertyName + "_entities", JSON.stringify(entities));
    }

    signOut() {
        localStorage.clear();
        this.router.navigate(['/auth/signin']);
    }

    login(user: Login): Observable<any> {
        return this.httpService.post<Response>(GlobalConstants.ApiUrl.User.Authentication, user);
    }

    userDetails(username: string): Observable<any> {
        return this.httpService.get<any>(GlobalConstants.ApiUrl.User.UserDetails + username);
    }
}
