/**
 * FHEdback Frontend Integration Examples
 * 
 * This file provides examples of how to use the updated contract addresses and ABIs
 * in your frontend application.
 * 
 * Updated: September 1, 2025
 * Network: Sepolia Testnet
 */

import { ethers } from 'ethers';
import { FACTORY_ADDRESS, ABIS, NETWORK_CONFIG } from './index';

/**
 * Example 1: Initialize Factory Contract
 */
export async function initializeFactoryContract(provider: ethers.Provider) {
  const factory = new ethers.Contract(
    FACTORY_ADDRESS,
    ABIS.factory,
    provider
  );
  
  return factory;
}

/**
 * Example 2: Create a New Survey
 */
export async function createSurvey(
  signer: ethers.Signer,
  surveyData: {
    owner: string;
    symbol: string;
    metadataHash: string;
    questionsHash: string;
    scale: number;
    maxRespondents: number;
  }
) {
  const factory = new ethers.Contract(FACTORY_ADDRESS, ABIS.factory, signer);
  
  const tx = await factory.createSurvey(
    surveyData.owner,
    surveyData.symbol,
    surveyData.metadataHash,
    surveyData.questionsHash,
    surveyData.scale,
    surveyData.maxRespondents
  );
  
  const receipt = await tx.wait();
  
  // Extract survey address from events
  const surveyCreatedEvent = receipt.logs?.find(
    (log: ethers.EventLog) => {
      try {
        const parsed = factory.interface.parseLog(log);
        return parsed?.name === 'SurveyCreated';
      } catch {
        return false;
      }
    }
  );
  
  let surveyAddress = '';
  if (surveyCreatedEvent) {
    const parsed = factory.interface.parseLog(surveyCreatedEvent);
    surveyAddress = parsed?.args?.surveyAddress || '';
  }
  
  return {
    surveyAddress,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber
  };
}

/**
 * Example 3: Get Survey Instance
 */
export function getSurveyContract(surveyAddress: string, provider: ethers.Provider) {
  return new ethers.Contract(
    surveyAddress,
    ABIS.survey,
    provider
  );
}

/**
 * Example 4: Submit Survey Response
 */
export async function submitSurveyResponse(
  surveyAddress: string,
  signer: ethers.Signer,
  encryptedResponses: string[]
) {
  const survey = new ethers.Contract(surveyAddress, ABIS.survey, signer);
  
  const tx = await survey.submitResponses(encryptedResponses);
  const receipt = await tx.wait();
  
  return receipt;
}

/**
 * Example 5: Get Factory Stats
 */
export async function getFactoryStats(provider: ethers.Provider) {
  const factory = new ethers.Contract(FACTORY_ADDRESS, ABIS.factory, provider);
  
  const totalSurveys = await factory.totalSurveys();
  const beacon = await factory.getBeacon();
  
  return {
    totalSurveys: Number(totalSurveys),
    beaconAddress: beacon,
    factoryAddress: FACTORY_ADDRESS
  };
}

/**
 * Example 6: Network Verification
 */
export function verifyNetwork(chainId: number) {
  if (chainId !== NETWORK_CONFIG.chainId) {
    throw new Error(
      `Wrong network! Please connect to ${NETWORK_CONFIG.name} (Chain ID: ${NETWORK_CONFIG.chainId})`
    );
  }
  return true;
}

/**
 * Example 7: React Hook Usage Example
 */
export const useFactoryContract = (provider?: ethers.Provider) => {
  if (!provider) return null;
  
  return {
    contract: new ethers.Contract(FACTORY_ADDRESS, ABIS.factory, provider),
    address: FACTORY_ADDRESS,
    abi: ABIS.factory,
    networkConfig: NETWORK_CONFIG
  };
};

// Export useful constants for quick reference
export const QUICK_REFERENCE = {
  FACTORY_ADDRESS,
  NETWORK_CONFIG,
  BLOCK_EXPLORER: `${NETWORK_CONFIG.blockExplorer}/address/${FACTORY_ADDRESS}`,
  ABIS
};

export default {
  initializeFactoryContract,
  createSurvey,
  getSurveyContract,
  submitSurveyResponse,
  getFactoryStats,
  verifyNetwork,
  useFactoryContract,
  QUICK_REFERENCE
};
