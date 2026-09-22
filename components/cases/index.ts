import type { ComponentType } from "react";
import type { Case } from "@/lib/dict";
import type { CaseProps } from "./types";
import Amazon from "./Amazon";
import CryptoLockedStaking from "./CryptoLockedStaking";
import GameDeployer from "./GameDeployer";
import GameInterfaceStudy from "./GameInterfaceStudy";
import GameQuest from "./GameQuest";
import HrisDashboard from "./HrisDashboard";
import InvestmentAppReimagined from "./InvestmentAppReimagined";
import NanovestAppRedesign from "./NanovestAppRedesign";
import NanovestCalendar from "./NanovestCalendar";
import NanovestForeignStocks from "./NanovestForeignStocks";
import NanovestInvestmentApp from "./NanovestInvestmentApp";
import NanovestLimitOrder from "./NanovestLimitOrder";
import NanovestUsStocksIpo from "./NanovestUsStocksIpo";
import RampageEvolutionCard from "./RampageEvolutionCard";
import StiqyDashboard from "./StiqyDashboard";

export type { CaseProps };

/**
 * Registry halaman case study: satu komponen per proyek.
 *
 * Tiap proyek boleh punya layout sendiri — tidak ada komponen
 * "CaseStudy" generik yang harus dipaksa memuat semuanya. Slug-nya
 * sama dengan key di content/*.json → "cases", dan sama dengan
 * segment URL /[lang]/work/[slug].
 *
 * Menambah proyek = satu komponen di folder ini, satu baris di
 * sini, satu entri di JSON, satu generator preview di scripts/.
 *
 * Cast-nya disengaja dan hanya ada di sini. Tiap komponen menerima
 * bentuk case-nya sendiri, sedangkan registry dipanggil dengan
 * union `Case` karena slug-nya baru diketahui saat runtime.
 * work/[slug]/page.tsx yang menjamin keduanya sepasang: data dan
 * komponen diambil dari key yang sama, dan halaman 404 kalau salah
 * satunya tidak ada.
 */
export const CASE_PAGES: Record<string, ComponentType<CaseProps<Case>>> = {
  "nanovest-app-redesign": NanovestAppRedesign as ComponentType<CaseProps<Case>>,
  "nanovest-calendar": NanovestCalendar as ComponentType<CaseProps<Case>>,
  "nanovest-investment-app": NanovestInvestmentApp as ComponentType<CaseProps<Case>>,
  "nanovest-limit-order": NanovestLimitOrder as ComponentType<CaseProps<Case>>,
  "nanovest-foreign-stocks": NanovestForeignStocks as ComponentType<CaseProps<Case>>,
  "nanovest-us-stocks-ipo": NanovestUsStocksIpo as ComponentType<CaseProps<Case>>,
  "amazon": Amazon as ComponentType<CaseProps<Case>>,
  "crypto-locked-staking": CryptoLockedStaking as ComponentType<CaseProps<Case>>,
  "game-interface-study": GameInterfaceStudy as ComponentType<CaseProps<Case>>,
  "game-quest": GameQuest as ComponentType<CaseProps<Case>>,
  "rampage-evolution-card": RampageEvolutionCard as ComponentType<CaseProps<Case>>,
  "hris-dashboard": HrisDashboard as ComponentType<CaseProps<Case>>,
  "stiqy-dashboard": StiqyDashboard as ComponentType<CaseProps<Case>>,
  "game-deployer": GameDeployer as ComponentType<CaseProps<Case>>,
  "investment-app-reimagined": InvestmentAppReimagined as ComponentType<CaseProps<Case>>,
};
