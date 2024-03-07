import { createApp } from "vue"
import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import colors from "vuetify/util/colors"

import "./style.css"
import "vuetify/styles"
import "@mdi/font/css/materialdesignicons.css"

import App from "./App.vue"

const app = createApp(App)
const pinia = createPinia().use(piniaPluginPersistedstate)
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          primary: colors.amber.base,
        },
      },
    },
  },
})

app.use(pinia).use(vuetify).mount("#app")
