// These imports force TS compiler to evaluate contained declarations
//  which by defaults would be ignored because inside node_modules
//  and not directly referenced by any file
// These types had to be moved from `quasar` to `@quasar/app-webpack` to avoid generating TS errors
//  in Vue CLI projects, given that these features are only available for Quasar CLI projects
// TS doesn't allow re-exports into module augmentation, so we were forced to
//  manually declare every file as a `quasar` augmentation

export * from "@quasar/app-shared";
