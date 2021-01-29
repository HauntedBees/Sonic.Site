<template>
    <v-col cols="12">
        <v-row>
            <v-col class="d-none d-sm-block">
                <h2 class="beesubmessage mb-5">Entries ({{count}})</h2>
            </v-col>
            <v-col>
                <v-text-field v-model="search" dark append-icon="mdi-magnify" label="Search" />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-list color="var(--clear-list)" v-if="companies.length > 0" two-line subheader>
                    <BeeCompany v-for="item in companies" :item="item" :key="item.id" />
                </v-list>
            </v-col>
        </v-row>
        <div v-show="!endOfList" class="row mb-10 mt-5" ref="loadBottom">
            <!--<Loader color="var(--action)" size="64" width="2"/>-->
            <v-progress-circular class="mx-auto" color="var(--action)" size="64" width="2" indeterminate />
        </div>
        <div v-show="endOfList" class="row mb-10 mt-5">
            <BeeSubheader class="mx-auto" text="That's everything we have right now."/>
        </div>
    </v-col>
</template>
<script>
    import { bee } from "src/utils/webmethod.js";
    export default {
        data () {
            return {
                offset: 0,
                count: 0, 
                search: "",
                endOfList: false, 
                observer: null,
                companies: []
            }
        },
        watch: {
            search(val) {
                const vt = val.trim();
                if(vt.length < 3 && vt.length > 0) { return; }
                this.endOfList = false;
                this.companies = [];
                this.offset = 0;
                this.LoadCompanies();
            }
        },
        beforeMount() { this.LoadCompanies(); },
        mounted() {
            this.observer = new IntersectionObserver(() => this.ReachedBottom(), { root: null, threshold: 1 });
            this.observer.observe(this.$refs.loadBottom);
        },
        methods: {
            ReachedBottom() {
                if(this.companies.length === 0 || this.$store.state.loading) { return; }
                this.LoadCompanies();
            },
            LoadCompanies() {
                bee.get("CompaniesPage", [this.search.trim(), this.offset], data => {
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