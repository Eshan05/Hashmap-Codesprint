import { MedicineSearchMode } from '@/types/medicine-search';
import { SchemaType } from '@google/generative-ai';

const searchType: MedicineSearchMode = 'disease';

const schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING },
    commonPayload: {
      type: SchemaType.OBJECT,
      properties: {
        summary: { type: SchemaType.STRING },
        keyTakeaways: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        clinicalActions: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              rationale: { type: SchemaType.STRING },
              priority: { type: SchemaType.STRING },
              evidenceLevel: { type: SchemaType.STRING },
            },
            required: ['title', 'rationale', 'priority'],
          },
        },
        riskAlerts: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              severity: { type: SchemaType.STRING },
              mitigation: { type: SchemaType.STRING },
              triggerNotes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ['name', 'severity', 'mitigation'],
          },
        },
        interactionNotes: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              interactingAgent: { type: SchemaType.STRING },
              effect: { type: SchemaType.STRING },
              recommendation: { type: SchemaType.STRING },
              evidenceLevel: { type: SchemaType.STRING },
            },
            required: ['interactingAgent', 'effect', 'recommendation'],
          },
        },
        monitoringGuidance: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              metric: { type: SchemaType.STRING },
              frequency: { type: SchemaType.STRING },
              note: { type: SchemaType.STRING },
            },
            required: ['metric', 'frequency', 'note'],
          },
        },
        references: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              label: { type: SchemaType.STRING },
              url: { type: SchemaType.STRING },
              citation: { type: SchemaType.STRING },
            },
            required: ['label'],
          },
        },
        followUpPrompts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        patientCounseling: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        disclaimer: { type: SchemaType.STRING },
      },
      required: ['summary', 'keyTakeaways', 'clinicalActions', 'riskAlerts', 'interactionNotes', 'monitoringGuidance', 'references', 'followUpPrompts', 'patientCounseling', 'disclaimer'],
    },
    modePayload: searchType === 'disease' ? {
      type: SchemaType.OBJECT,
      properties: {
        pathophysiologySnapshot: { type: SchemaType.STRING },
        firstLineTherapies: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              rationale: { type: SchemaType.STRING },
              cautions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              evidenceLevel: { type: SchemaType.STRING },
            },
            required: ['name', 'rationale'],
          }
        },
        secondLineOptions: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              rationale: { type: SchemaType.STRING },
              cautions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              evidenceLevel: { type: SchemaType.STRING },
            },
            required: ['name', 'rationale'],
          }
        },
        combinationStrategies: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              rationale: { type: SchemaType.STRING },
              cautions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              evidenceLevel: { type: SchemaType.STRING },
            },
            required: ['name', 'rationale'],
          }
        },
        monitoringPlan: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              metric: { type: SchemaType.STRING },
              frequency: { type: SchemaType.STRING },
              note: { type: SchemaType.STRING },
            },
            required: ['metric', 'frequency', 'note'],
          }
        },
        nonPharmacologicAdjuncts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        redFlags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ['pathophysiologySnapshot', 'firstLineTherapies', 'secondLineOptions', 'combinationStrategies', 'monitoringPlan', 'nonPharmacologicAdjuncts', 'redFlags'],
    } : searchType === 'name' ? {
      type: SchemaType.OBJECT,
      properties: {
        mechanism: { type: SchemaType.STRING },
        primaryIndications: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              condition: { type: SchemaType.STRING },
              note: { type: SchemaType.STRING },
            },
            required: ['condition', 'note'],
          },
        },
        formulations: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              form: { type: SchemaType.STRING },
              strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              release: { type: SchemaType.STRING },
              notes: { type: SchemaType.STRING },
            },
            required: ['form', 'strengths'],
          }
        },
        dosingGuidance: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              population: { type: SchemaType.STRING },
              dose: { type: SchemaType.STRING },
              frequency: { type: SchemaType.STRING },
              maxDose: { type: SchemaType.STRING },
              titration: { type: SchemaType.STRING },
            },
            required: ['population', 'dose', 'frequency'],
          }
        },
        doseAdjustments: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              factor: { type: SchemaType.STRING },
              recommendation: { type: SchemaType.STRING },
              rationale: { type: SchemaType.STRING },
            },
            required: ['factor', 'recommendation'],
          }
        },
        contraindications: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        blackBoxWarnings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        commonSideEffects: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        seriousSideEffects: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        monitoringParameters: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              metric: { type: SchemaType.STRING },
              frequency: { type: SchemaType.STRING },
              note: { type: SchemaType.STRING },
            },
            required: ['metric', 'frequency', 'note'],
          }
        },
        patientCounselingPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ['mechanism', 'primaryIndications', 'formulations', 'dosingGuidance', 'doseAdjustments', 'contraindications', 'blackBoxWarnings', 'commonSideEffects', 'seriousSideEffects', 'monitoringParameters', 'patientCounselingPoints'],
    } : searchType === 'sideEffects' ? {
      type: SchemaType.OBJECT,
      properties: {
        likelyCulprits: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              drugName: { type: SchemaType.STRING },
              likelihood: { type: SchemaType.STRING },
              mechanism: { type: SchemaType.STRING },
              onsetTiming: { type: SchemaType.STRING },
            },
            required: ['drugName', 'likelihood', 'mechanism', 'onsetTiming'],
          },
        },
        mechanisticInsights: { type: SchemaType.STRING },
        managementStrategies: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              strategy: { type: SchemaType.STRING },
              steps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              monitoring: { type: SchemaType.STRING },
            },
            required: ['strategy', 'steps'],
          },
        },
        alternativeOptions: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              comparison: { type: SchemaType.STRING },
              pros: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              cons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ['name', 'comparison', 'pros', 'cons'],
          }
        },
        whenToEscalate: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        documentationTips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ['likelyCulprits', 'mechanisticInsights', 'managementStrategies', 'alternativeOptions', 'whenToEscalate', 'documentationTips'],
    } : searchType === 'ingredient' ? {
      type: SchemaType.OBJECT,
      properties: {
        products: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              productName: { type: SchemaType.STRING },
              form: { type: SchemaType.STRING },
              strength: { type: SchemaType.STRING },
              otc: { type: SchemaType.BOOLEAN },
            },
            required: ['productName', 'form', 'strength', 'otc'],
          },
        },
        brandEquivalents: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        therapeuticClasses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        formulationDetails: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              form: { type: SchemaType.STRING },
              strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              release: { type: SchemaType.STRING },
              notes: { type: SchemaType.STRING },
            },
            required: ['form', 'strengths'],
          }
        },
        regulatoryNotes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        availabilityConsiderations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        qualityFlags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ['products', 'brandEquivalents', 'therapeuticClasses', 'formulationDetails', 'regulatoryNotes', 'availabilityConsiderations', 'qualityFlags'],
    } : searchType === 'similar' ? {
      type: SchemaType.OBJECT,
      properties: {
        alternatives: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              comparison: { type: SchemaType.STRING },
              pros: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              cons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ['name', 'comparison', 'pros', 'cons'],
          }
        },
        comparisonMatrix: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              attribute: { type: SchemaType.STRING },
              baseline: { type: SchemaType.STRING },
              alternatives: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING },
                    detail: { type: SchemaType.STRING },
                  },
                  required: ['name', 'detail'],
                },
              },
            },
            required: ['attribute', 'baseline', 'alternatives'],
          }
        },
        switchingGuidance: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        costConsiderations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        transitionRisks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        monitoringAfterSwitch: {
          type: SchemaType.ARRAY, items: {
            type: SchemaType.OBJECT,
            properties: {
              metric: { type: SchemaType.STRING },
              frequency: { type: SchemaType.STRING },
              note: { type: SchemaType.STRING },
            },
            required: ['metric', 'frequency', 'note'],
          }
        },
      },
      required: ['alternatives', 'comparisonMatrix', 'switchingGuidance', 'costConsiderations', 'transitionRisks', 'monitoringAfterSwitch'],
    } : (() => { throw new Error(`Unsupported searchType: ${searchType}`); })(),
  },
  required: ['title', 'summary', 'commonPayload', 'modePayload'],
};