<template>
    <v-container>
        <v-row class="d-block d-sm-none">
            <v-chip-group column>
                <v-chip v-show="browseTree.length > 0" dark class="selectionchip" @click="GoBack(-1)">
                    <v-icon>mdi-arrow-left-circle</v-icon> Reset
                </v-chip>
                <v-chip v-for="(it, idx) in browseTree" :key="it.id" dark class="selectionchip" @click="GoBack(idx)">
                    <v-icon>mdi-{{it.icon}}</v-icon> {{it.name}}
                </v-chip>
            </v-chip-group>
        </v-row>
        <v-row>
            <v-col cols="3" class="d-none d-sm-block">
                <h2 class="beesubmessage">Categories <span v-show="filterCategory !== 0">({{count}})</span></h2>
                <v-chip-group column>
                    <v-chip v-show="browseTree.length > 0" dark class="selectionchip" @click="GoBack(-1)">
                        <v-icon>mdi-arrow-left-circle</v-icon> Reset
                    </v-chip>
                    <v-chip v-for="(it, idx) in browseTree" :key="it.id" dark class="selectionchip" @click="GoBack(idx)">
                        <v-icon>mdi-{{it.icon}}</v-icon> {{it.name}}
                    </v-chip>
                </v-chip-group>
            </v-col>
            <v-col>
                <v-chip-group column>
                    <v-chip v-for="it in categories" :key="it.id" @click="LoadCategories(it.id)" dark class="selectionchip"
                        :style="{ 'border-right': `2px solid ${it.color}`, 'border-bottom': `2px solid ${it.color}` }">
                        <v-icon>mdi-{{it.icon}}</v-icon> {{it.name}}
                    </v-chip>
                </v-chip-group>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-list color="var(--clear-list)" v-if="companies.length > 0" two-line subheader>
                    <BeeCompany v-for="item in companies" :item="item" :key="item.id" />
                </v-list>
            </v-col>
        </v-row>
        <v-row v-show="!endOfList" ref="loadBottom">
            <v-col>
                <Loader color="var(--action)" size="64" width="2" />
            </v-col>
        </v-row>
        <div v-show="endOfList" class="row mb-10 mt-5">
            <BeeSubheader v-show="filterCategory === 0" class="mx-auto" text="Select a category to begin drilling down!"/>
            <BeeSubheader v-show="filterCategory !== 0" class="mx-auto" text="That's everything we have right now."/>
        </div>
    </v-container>
</template>
<script>
    import { bee } from "src/utils/webmethod.js";
    export default {
        data () {
            return {
                cachedResults: {},
                offset: 0,
                count: 0,
                filterCategory: 0,
                browseTree: [],
                selectedIdxes: [],
                selectedTypes: [],
                companies: [],
                categories: [],
                endOfList: false, 
                observer: null
            }
        },
        beforeMount() {
            this.LoadInitialCategories();
            this.LoadCompanies();
        },
        mounted() {
            this.observer = new IntersectionObserver(() => this.ReachedBottom(), { root: null, threshold: 1 });
            this.observer.observe(this.$refs.loadBottom);
        },
        methods: {
            GoBack(idx) {
                if(idx < 0) {
                    this.browseTree = [];
                    this.filterCategory = 0;
                    this.categories = this.cachedResults["0"];
                } else {
                    this.browseTree = this.browseTree.slice(0, idx + 1);
                    this.filterCategory = this.browseTree[this.browseTree.length - 1].id;
                    this.categories = this.cachedResults[this.filterCategory];
                }
                this.offset = 0;
                this.endOfList = false;
                this.companies = [];
                this.LoadCompanies();
            },
            ReachedBottom() {
                if(this.companies.length === 0 || this.$store.state.loading) { return; }
                this.LoadCompanies();
            },
            LoadInitialCategories() {
                bee.get("RootCategories", null, data => {
                    this.categories = data.result;
                    this.cachedResults["0"] = data.result;
                });
            },
            LoadCategories(category) {
                this.browseTree.push(this.categories.filter(i=>i.id===category)[0]);
                this.filterCategory = category;
                this.offset = 0;
                this.endOfList = false;
                this.companies = [];
                if(this.cachedResults[category]) {
                    this.categories = this.cachedResults[category];
                    this.LoadCompanies();
                } else {
                    bee.get("ChildCategories", [category], data => {
                        this.categories = data.result;
                        this.cachedResults[category] = data.result;
                        this.LoadCompanies();
                    });
                }
            },
            LoadCompanies() {
                bee.get("CompaniesByCategoryPage", [this.filterCategory, this.offset], data => {
                    const resItems = data.result;
                    this.count = data.count;
                    if(resItems.length === 0) {
                        this.endOfList = true;
                    } else {
                        this.endOfList = resItems.length < 15; // TODO: this probably works; adjust if page size changes on server
                        this.companies.push(...resItems);
                        this.offset += 1;
                    }
                });
            }
        }
    }
</script>