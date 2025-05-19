import { HealthRecord } from '../components/NutritionistDashboard';

declare const healthRecordService: {
  getAllRecords: () => Promise<HealthRecord[]>;
  updateRecord: (record: HealthRecord) => Promise<HealthRecord>;
};

export { healthRecordService }; 