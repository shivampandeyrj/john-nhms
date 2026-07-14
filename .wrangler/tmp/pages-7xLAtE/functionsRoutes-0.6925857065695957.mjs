import { onRequestPost as __api_auth_login_js_onRequestPost } from "/home/shivam/Music/john  newhabitsmindsetshifts /functions/api/auth/login.js"
import { onRequestDelete as __api_magnets__id__js_onRequestDelete } from "/home/shivam/Music/john  newhabitsmindsetshifts /functions/api/magnets/[id].js"
import { onRequestPut as __api_magnets__id__js_onRequestPut } from "/home/shivam/Music/john  newhabitsmindsetshifts /functions/api/magnets/[id].js"
import { onRequestGet as __api_config_js_onRequestGet } from "/home/shivam/Music/john  newhabitsmindsetshifts /functions/api/config.js"
import { onRequestPost as __api_config_js_onRequestPost } from "/home/shivam/Music/john  newhabitsmindsetshifts /functions/api/config.js"
import { onRequestPost as __api_leads_js_onRequestPost } from "/home/shivam/Music/john  newhabitsmindsetshifts /functions/api/leads.js"
import { onRequestGet as __api_magnets_js_onRequestGet } from "/home/shivam/Music/john  newhabitsmindsetshifts /functions/api/magnets.js"
import { onRequestPost as __api_magnets_js_onRequestPost } from "/home/shivam/Music/john  newhabitsmindsetshifts /functions/api/magnets.js"
import { onRequest as __admin__middleware_js_onRequest } from "/home/shivam/Music/john  newhabitsmindsetshifts /functions/admin/_middleware.js"
import { onRequestGet as ____slug___js_onRequestGet } from "/home/shivam/Music/john  newhabitsmindsetshifts /functions/[[slug]].js"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/magnets/:id",
      mountPath: "/api/magnets",
      method: "DELETE",
      middlewares: [],
      modules: [__api_magnets__id__js_onRequestDelete],
    },
  {
      routePath: "/api/magnets/:id",
      mountPath: "/api/magnets",
      method: "PUT",
      middlewares: [],
      modules: [__api_magnets__id__js_onRequestPut],
    },
  {
      routePath: "/api/config",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_config_js_onRequestGet],
    },
  {
      routePath: "/api/config",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_config_js_onRequestPost],
    },
  {
      routePath: "/api/leads",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_leads_js_onRequestPost],
    },
  {
      routePath: "/api/magnets",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_magnets_js_onRequestGet],
    },
  {
      routePath: "/api/magnets",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_magnets_js_onRequestPost],
    },
  {
      routePath: "/admin",
      mountPath: "/admin",
      method: "",
      middlewares: [__admin__middleware_js_onRequest],
      modules: [],
    },
  {
      routePath: "/:slug*",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [____slug___js_onRequestGet],
    },
  ]