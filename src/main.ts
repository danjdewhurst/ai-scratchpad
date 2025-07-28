import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

console.log('Main.ts loading...');

try {
  const app = createApp(App);
  console.log('Vue app created');
  app.mount("#app");
  console.log('Vue app mounted');
} catch (error) {
  console.error('Error mounting app:', error);
}
