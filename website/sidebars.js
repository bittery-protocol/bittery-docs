module.exports = {
  tutorialSidebar: [
    'intro',
    'protocol-overview',
    'architecture',
    'architecture-report',
    'BII-spec',
    'BTRY-payload',
    'round-lifecycle',
    'indexer-spec',
    'indexer-flow',
    'validation-rules',
    'VRF-spec',
    'TSS-settlement',
    'security-model',
    'storage-model',
    {
      type: 'category',
      label: 'BLIP Proposals',
      items: [
        'blip/BLIP-001-BII',
        'blip/BLIP-002-BTRY',
        'blip/BLIP-003-IndexerConsensus',
      ],
    },
  ],
};
