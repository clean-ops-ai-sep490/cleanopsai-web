const SEGMENTATION_BENCHMARK_ASSET_ROOT = "/ai-benchmark/segmentation";

const segmentationBenchmarkRows = [
  { image: "own_mobile_benchmark_20260524_8a472d643f13942d2e79c054f141097f_e9936f3f00.jpg", pixelAccuracy: 0.982354, meanIou: 0.491177, meanDiceF1: 0.495549 },
  { image: "own_mobile_benchmark_20260524_b8fcbb3d9cbd7164a8715807f91def53_48b8aa163b.jpg", pixelAccuracy: 0.973811, meanIou: 0.486905, meanDiceF1: 0.493366 },
  { image: "own_mobile_benchmark_20260524_IMG_20260519_162305_14f9359823.jpg", pixelAccuracy: 0.999367, meanIou: 0.499683, meanDiceF1: 0.499842 },
  { image: "own_mobile_benchmark_20260524_IMG_20260521_202618_070eb084dc.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_20260521_202641_a82bf4edaa.jpg", pixelAccuracy: 0.999611, meanIou: 0.93289, meanDiceF1: 0.964046 },
  { image: "own_mobile_benchmark_20260524_IMG_20260521_202701_c6f5b71a94.jpg", pixelAccuracy: 0.994105, meanIou: 0.497052, meanDiceF1: 0.498522 },
  { image: "own_mobile_benchmark_20260524_IMG_20260521_202725_99f9c46e07.jpg", pixelAccuracy: 0.945115, meanIou: 0.547241, meanDiceF1: 0.616112 },
  { image: "own_mobile_benchmark_20260524_IMG_20260521_202739_86cbc94de4.jpg", pixelAccuracy: 0.946057, meanIou: 0.643173, meanDiceF1: 0.740487 },
  { image: "own_mobile_benchmark_20260524_IMG_5800_98828627eb.jpg", pixelAccuracy: 0.923058, meanIou: 0.461529, meanDiceF1: 0.479995 },
  { image: "own_mobile_benchmark_20260524_IMG_5801_c162edc5de.jpg", pixelAccuracy: 0.999909, meanIou: 0.499954, meanDiceF1: 0.499977 },
  { image: "own_mobile_benchmark_20260524_IMG_5802_a8a58add28.jpg", pixelAccuracy: 0.899579, meanIou: 0.633192, meanDiceF1: 0.649044 },
  { image: "own_mobile_benchmark_20260524_IMG_5803_7bf3c9d086.jpg", pixelAccuracy: 0.816023, meanIou: 0.272114, meanDiceF1: 0.299629 },
  { image: "own_mobile_benchmark_20260524_IMG_5804_1a437ec857.jpg", pixelAccuracy: 0.580685, meanIou: 0.199803, meanDiceF1: 0.249846 },
  { image: "own_mobile_benchmark_20260524_IMG_5805_ddfc56f11b.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_5806_473abc27a5.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_5807_4119f7aa40.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_5808_51a86a71ad.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_5814_3f41cb2835.jpg", pixelAccuracy: 0.998796, meanIou: 0.499398, meanDiceF1: 0.499699 },
  { image: "own_mobile_benchmark_20260524_IMG_6033_5ca9e5b41d.jpg", pixelAccuracy: 0.706077, meanIou: 0.353038, meanDiceF1: 0.41386 },
  { image: "own_mobile_benchmark_20260524_IMG_6034_a0eb857905.jpg", pixelAccuracy: 0.821675, meanIou: 0.410888, meanDiceF1: 0.451158 },
  { image: "own_mobile_benchmark_20260524_IMG_6035_240764b24b.jpg", pixelAccuracy: 0.914951, meanIou: 0.457475, meanDiceF1: 0.477793 },
  { image: "own_mobile_benchmark_20260524_IMG_6036_cba7b42e0e.jpg", pixelAccuracy: 0.954803, meanIou: 0.477402, meanDiceF1: 0.48844 },
  { image: "own_mobile_benchmark_20260524_IMG_6037_829a088993.jpg", pixelAccuracy: 0.937545, meanIou: 0.468772, meanDiceF1: 0.483883 },
  { image: "own_mobile_benchmark_20260524_IMG_6038_e01de536e6.jpg", pixelAccuracy: 0.912829, meanIou: 0.456414, meanDiceF1: 0.477214 },
  { image: "own_mobile_benchmark_20260524_IMG_6039_4048ce23db.jpg", pixelAccuracy: 0.96498, meanIou: 0.48249, meanDiceF1: 0.491089 },
  { image: "own_mobile_benchmark_20260524_IMG_6040_a746f5a86e.jpg", pixelAccuracy: 0.860279, meanIou: 0.430139, meanDiceF1: 0.462446 },
  { image: "own_mobile_benchmark_20260524_IMG_6041_0e9206437a.jpg", pixelAccuracy: 0.993816, meanIou: 0.496908, meanDiceF1: 0.498449 },
  { image: "own_mobile_benchmark_20260524_IMG_6043_c5d9a7e0dd.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_6045_59fbfb2ebb.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_6046_7d445b4481.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_6047_90a06909f7.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_6048_b67e6aadba.jpg", pixelAccuracy: 0.971378, meanIou: 0.533072, meanDiceF1: 0.579353 },
  { image: "own_mobile_benchmark_20260524_IMG_6049_7ddbe58f9a.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_6050_12dedea3f6.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_6051_9e7b68d35f.jpg", pixelAccuracy: 0.999559, meanIou: 0.499779, meanDiceF1: 0.49989 },
  { image: "own_mobile_benchmark_20260524_IMG_6063_4437aedfa5.jpg", pixelAccuracy: 0.997776, meanIou: 0.498888, meanDiceF1: 0.499443 },
  { image: "own_mobile_benchmark_20260524_IMG_6064_89c5c5a175.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_6065_94819336b5.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_6066_a54be1c31f.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_6067_99a21a77c2.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_IMG_6068_1eeae59d8e.jpg", pixelAccuracy: 0.999494, meanIou: 0.949041, meanDiceF1: 0.973166 },
  { image: "own_mobile_benchmark_20260524_IMG_6069_05941e3d0c.jpg", pixelAccuracy: 0.999986, meanIou: 0.666662, meanDiceF1: 0.666664 },
  { image: "own_mobile_benchmark_20260524_IMG_6070_719650554d.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_z7835592886208_cd6a319a6f4c0dca33d13e8c9fd512a7_a9f10fcc45.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_z7835592916869_1456ec2f516a666d7c3068a7ad72a2df_10b8d556b8.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
  { image: "own_mobile_benchmark_20260524_z7835592932071_a48ab61a58f332a564fafba2ad7fedc6_1c557d5850.jpg", pixelAccuracy: 1, meanIou: 1, meanDiceF1: 1 },
] as const;

export const segmentationBenchmarkDataset = {
  title: "Bộ ảnh benchmark phân vùng",
  imageCount: 46,
  maskCount: 46,
  missingMasks: 0,
  pixelAccuracy: 0.96008,
  meanIou: 0.418637,
  meanDiceF1: 0.478676,
  reports: {
    metricsJson: `${SEGMENTATION_BENCHMARK_ASSET_ROOT}/reports/benchmark_metrics.json`,
    metricsCsv: `${SEGMENTATION_BENCHMARK_ASSET_ROOT}/reports/benchmark_metrics.csv`,
    perImageCsv: `${SEGMENTATION_BENCHMARK_ASSET_ROOT}/reports/benchmark_per_image.csv`,
    summary: `${SEGMENTATION_BENCHMARK_ASSET_ROOT}/reports/report_summary.md`,
  },
  samples: segmentationBenchmarkRows.map((sample, index) => {
    const overlayName = sample.image.replace(/\.jpg$/, "_benchmark_overlay.jpg");

    return {
      id: `benchmark-${String(index + 1).padStart(2, "0")}`,
      title: `Mẫu ${String(index + 1).padStart(2, "0")}`,
      imagePath: `${SEGMENTATION_BENCHMARK_ASSET_ROOT}/images/${sample.image}`,
      overlayPath: `${SEGMENTATION_BENCHMARK_ASSET_ROOT}/overlays/${overlayName}`,
      pixelAccuracy: sample.pixelAccuracy,
      meanIou: sample.meanIou,
      meanDiceF1: sample.meanDiceF1,
    };
  }),
} as const;

export type SegmentationBenchmarkSample =
  (typeof segmentationBenchmarkDataset.samples)[number];
