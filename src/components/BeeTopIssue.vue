<template>
    <div style="display:inline-block">
        <v-tooltip top style="vertical-align:top">
            <template v-slot:activator="{on, attrs}">
                    <v-chip v-bind="attrs" v-on="on" @click="showSources=!showSources" dark class="selectionchip ma-1 pointer">
                        <v-icon :color="item.issueColor">mdi-{{item.issueIcon}}</v-icon>
                    </v-chip>
            </template>
            <span>{{item.issueType}}</span>
        </v-tooltip>
        <div v-show="showSources">
            <ax v-for="(source, idx) in item.sources" :key="idx" :href="source">[Source]</ax>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            "item": { type: Object, required: true }
        },
        data: () => ({
            showSources: false
        })
    }
</script>