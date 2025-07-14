import fetch from 'node-fetch';

interface OceanDropConfig {
  apiKey: string;
  baseUrl: string;
}

interface GrantAccessParams {
  userId: string;
  videoId: string;
}

class OceanDropClient {
  private config: OceanDropConfig;

  constructor(config: OceanDropConfig) {
    this.config = config;
  }

  async grantAccess(params: GrantAccessParams): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/access/grant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`OceanDrop API error: ${response.statusText}`);
      }

      console.log(`Access granted to ${params.userId} for video ${params.videoId}`);
    } catch (error) {
      console.error('OceanDrop grant access error:', error);
      // Don't throw - this is optional functionality
    }
  }

  async revokeAccess(params: GrantAccessParams): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/access/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`OceanDrop API error: ${response.statusText}`);
      }

      console.log(`Access revoked from ${params.userId} for video ${params.videoId}`);
    } catch (error) {
      console.error('OceanDrop revoke access error:', error);
    }
  }
}

export default OceanDropClient;