// @ts-check
import * as baseConfigImport from "../../packages/eslint-config/base.js";
const baseConfig = baseConfigImport.default || baseConfigImport;
// Exporta a configuração base do monorepo no formato Flat Config (array)
export default [...baseConfig];