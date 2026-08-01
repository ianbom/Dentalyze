# Deep Learning for Tooth Identification and Enumeration in Panoramic Radiographs

## Article Information

**Article type:** Original Article  
**Journal:** *Dental Research Journal*  
**Year:** 2023  
**Article number:** 116  

### Authors

Soroush Sadr<sup>1</sup>, Hossein Mohammad-Rahimi<sup>2,3</sup>, Mohammad Soroush Ghorbanimehr<sup>4</sup>, Rata Rokhshad<sup>2,5</sup>, Zahra Abbasi<sup>6</sup>, Parisa Soltani<sup>7</sup>, Amirhossein Moaddabi<sup>8</sup>, Shahriar Shahab<sup>9</sup>, Mohammad Hossein Rohban<sup>3</sup>

### Affiliations

1. Department of Endodontics, School of Dentistry, Hamadan University of Medical Sciences, Hamadan, Iran  
2. Topic Group Dental Diagnostics and Digital Dentistry, ITU/WHO Focus Group AI on Health, Berlin, Germany  
3. Department of Computer Engineering, Sharif University of Technology, Tehran, Iran  
4. Department of Computer Science and Software Engineering, Concordia University, Montreal, Canada  
5. Department of Medicine, Section of Endocrinology, Nutrition, and Diabetes, Boston University Medical Center, Boston, MA, USA  
6. Department of Oral Health Sciences, Faculty of Dentistry, University of British Columbia, Vancouver, Canada  
7. Department of Oral and Maxillofacial Radiology, Dental Implants Research Center, School of Dentistry, Dental Research Institute, Isfahan University of Medical Sciences, Isfahan, Iran  
8. Department of Oral and Maxillofacial Surgery, Dental Research Center, School of Dentistry, Mazandaran University of Medical Sciences, Sari, Iran  
9. Department of Oral and Maxillofacial Radiology, School of Dentistry, Shahed University of Medical Sciences, Tehran, Iran  

### Correspondence

**Dr. Hossein Mohammad-Rahimi**  
Topic Group Dental Diagnostics and Digital Dentistry, ITU/WHO Focus Group AI on Health, Berlin, Germany  
Department of Computer Engineering, Sharif University of Technology, Tehran, Iran  
**E-mail:** ramtin.rhm@gmail.com

### Publication Timeline

- **Received:** 20 May 2023
- **Revised:** 30 October 2023
- **Accepted:** 4 November 2023
- **Published:** 27 November 2023

### Citation

Sadr S, Mohammad-Rahimi H, Ghorbanimehr MS, Rokhshad R, Abbasi Z, Soltani P, et al. Deep learning for tooth identification and enumeration in panoramic radiographs. *Dent Res J*. 2023;20:116.

---

## Abstract

### Background

Dentists begin the diagnosis by identifying and enumerating teeth. Panoramic radiographs are widely used for tooth identification due to their large field of view and low exposure dose. The automatic numbering of teeth in panoramic radiographs can assist clinicians in avoiding errors. Deep learning has emerged as a promising tool for automating tasks. The goal of this study was to evaluate the accuracy of a two-step deep learning method for tooth identification and enumeration in panoramic radiographs.

### Materials and Methods

In this retrospective observational study, 1007 panoramic radiographs were labeled by three experienced dentists. Bounding boxes were drawn in two distinct ways: one for teeth and one for quadrants.

All images were preprocessed using the contrast-limited adaptive histogram equalization method. First, panoramic images were allocated to a quadrant detection model, and the outputs of this model were provided to the tooth numbering models. A faster region-based convolutional neural network model was used in each step.

### Results

Average precision (AP) was calculated at different intersection-over-union thresholds. The AP50 of quadrant detection and tooth enumeration was 100% and 95%, respectively.

### Conclusion

The proposed two-step deep learning framework obtained promising results with a high level of AP for automatic tooth enumeration on panoramic radiographs. Further research should be conducted on diverse datasets and in real-life situations.

**Key words:** Deep learning, panoramic radiography, tooth identification, tooth numbering

---

## Introduction

Artificial intelligence (AI) refers to the use of a machine to simulate human intelligence and perform specific tasks, such as recognizing objects, making decisions, and solving problems. Machine learning is a subcategory of AI that uses algorithms to learn data patterns and predict outcomes.<sup>1</sup>

Deep learning, a category of machine learning models, has recently gained interest due to increasing data availability, increased computing power, and superior performance compared with conventional machine learning models.<sup>2</sup> Deep learning refers to deep or multilayered neural networks.

A neural network consists of several artificial neurons and connections with mathematical operations inspired by human neurons. It can automatically learn data patterns without explicit direction when given a large amount of data.

Convolutional neural networks (CNNs) were introduced for processing complex images. They use mathematical convolution functions that allow them to detect local connectivity patterns such as edges and corners in images.<sup>3</sup>

CNNs have been studied in maxillofacial imaging for automated diagnosis and treatment planning. They are primarily used to perform tasks such as:

1. Semantic segmentation, for example segmenting all teeth as the class “tooth”.
2. Instance segmentation, for example segmenting every tooth as an individual tooth.
3. Object detection.<sup>3,5</sup>

Object detection identifies the location of objects in an image using rectangular bounding boxes and classifies them into predefined groups.<sup>6</sup> Several CNN architectures have been proposed for this task, including region-based CNNs (R-CNNs) and You Only Look Once.

Panoramic radiographs are widely used in dental practice due to advantages such as low radiation dose, ease of production, and speed of acquisition.<sup>7</sup> They provide a two-dimensional image that typically includes all present teeth in both jaws and their supporting structures.

Panoramic radiographs provide valuable information about a patient’s dental condition that can be used for charting, screening, treatment planning, and forensic investigation.<sup>8,9</sup> Tooth identification is the first step in analyzing panoramic radiographs.<sup>6</sup>

Automated tooth identification and enumeration are the first steps toward a fully automatic diagnosis and treatment plan. This task can be carried out using CNN architectures. Object detection has previously been applied to automatic tooth enumeration in:

- Periapical radiographs.<sup>10,11</sup>
- Bitewing radiographs.<sup>12</sup>
- Panoramic radiographs.<sup>6,9,13-16</sup>

There are two main challenges in training deep learning models on panoramic radiographs:

1. A single image may contain up to 32 tooth classes, making model training difficult.
2. Panoramic images contain many structures other than teeth, such as cervical vertebrae, the nasal spine, maxillary sinuses, and mandibular condyles. These structures provide unnecessary data for a tooth enumeration model.

To address these issues, the authors proposed a two-step method:

1. Train a model to detect quadrants.
2. Train models to detect and enumerate teeth within each quadrant.

The hypothesis was that this method would improve the model’s average precision and recall compared with previous studies.

---

# Materials and Methods

## Study Design

This retrospective observational study was conducted and reported according to the Checklist for Artificial Intelligence in Medical Imaging guideline.<sup>17</sup>

The study consisted of two main stages:

1. Training a model to detect quadrants automatically.
2. Training models to detect and classify teeth from one to eight in upper and lower quadrants.

---

## Patient Selection

A total of 1007 panoramic radiographs were obtained from several sources in Iran and Brazil.

### 1. Shahid Beheshti University of Medical Sciences

**Location:** Department of Oral and Maxillofacial Radiology, Tehran, Iran  
**Population:** Iranian  
**Panoramic device:** Promax Dimax 3 Digital Pan/Ceph, Planmeca, Helsinki, Finland  
**Image format:** JPG  
**Image size:** 3252 × 1536 pixels  
**Number of images:** 83  
**Exposure settings:**

- 64-66 kVp
- 4-7 mA
- 15-18 seconds

### 2. Private Oral and Maxillofacial Radiology Center

**Location:** Tehran, Iran  
**Population:** Iranian  
**Panoramic device:** Planmeca ProMax, Planmeca, Helsinki, Finland  
**Image format:** JPG  
**Image size:** 2949 × 1435 pixels  
**Number of images:** 535  
**Exposure settings:**

- 64-72 kVp
- 6.3-12.5 mA
- 13.8-16 seconds

### 3. UFBA-UESC Dental Images Deep Dataset

**Source:** GitHub repository, `IvisionLab/deep-dental-image`  
**Population:** Brazilian  
**Image format:** JPG  
**Image size:** 1991 × 1127 pixels  
**Number of images:** 389  

### Inclusion Criteria

Radiographs with the following conditions were included:

- Tilted teeth.
- Implants.
- Retained roots.
- Crowns.
- Bridges.

### Exclusion Criteria

Radiographs with the following conditions were excluded:

- Low image quality.
- Motion artifacts.
- Deciduous teeth.
- Supernumerary teeth.
- Impacted teeth.
- Completely edentulous patients.

All radiographs were anonymized before inclusion in the study.

---

## Reference Dataset

Three independent dentists with at least three years of clinical experience provided the ground truth by drawing bounding boxes.

The dentists held a calibration session and labeled the first 20 images together.

The images were labeled in two separate ways:

1. R. R. and S. S. annotated teeth using LabelImg.<sup>19</sup>
2. R. R. and Z. A. labeled the quadrants.

All labels were double-checked by H. M. R. If there was any conflict or ambiguity regarding tooth numbers, the sample was excluded.

### Tooth Labeling

The tooth labeling process involved:

1. Drawing a rectangular bounding box around the outer edges of each tooth.
2. Classifying the tooth according to the two-digit FDI tooth numbering system.

### Quadrant Labeling

For maxillary and mandibular edentulous quadrants, the midline was used as the reference line.

#### Maxillary Quadrants

- **Superior-posterior reference:** Coronoid processes of the mandible.
- **Inferior-posterior reference:** Upper one-third of the retromolar pad.

For quadrants with teeth, all teeth and their roots were included.

- **Upper reference line:** Line connecting the palatal roots of the molars and the canine roots.
- **Inferior reference line:** Line below the incisal edges of the central incisors and canine.

#### Mandibular Quadrants

- **Superior-posterior reference:** Upper two-thirds of the retromolar pad.
- **Inferior-posterior reference:** Line passing below the inferior mandibular canal.

For quadrants with teeth:

- **Superior reference line:** Line above the cusp tips of the molars.
- **Inferior reference line:** Line below the lowest apex of mandibular roots.

---

## Preprocessing

The researchers applied contrast-limited adaptive histogram equalization (CLAHE) to all images.

CLAHE is a histogram-based image enhancement method that limits amplification using histogram clipping at a predefined level.

All images were resized to **224 × 224 pixels** before being provided to the model.

---

## Data Partitions

The 1007 panoramic images were first provided to the quadrant detection model.

The outputs of the quadrant detection model produced **4028 quadrant images**, which were then used as inputs for the tooth numbering models.

For both the quadrant detection and tooth enumeration stages, the data were divided as follows:

- **Training:** 60%
- **Validation:** 20%
- **Testing:** 20%

To prevent data leakage, all four quadrants from the same patient were included in the same dataset partition.

---

## Model

The framework consisted of two main models:

1. **Quadrant detection model:** Splits a panoramic image into four quadrants.
2. **Tooth enumeration model:** Receives one quadrant and detects and labels the teeth within that quadrant.

A one-stage end-to-end tooth enumeration model was also trained as a baseline for comparison.

---

## Quadrant Detection Model

The first object detector classified image regions as quadrants and generated final bounding box coordinates using Faster R-CNN with pretrained weights.

ResNet-50 was used as the base CNN.

Three methods were evaluated.

### 1. Four-Class Method

The quadrants were divided into four classes:

- Upper left.
- Upper right.
- Lower left.
- Lower right.

An end-to-end Faster R-CNN was trained.

### 2. Two-Class Method

The quadrants were divided into two classes:

- Upper quadrants.
- Lower quadrants.

The left and right quadrants were then determined using rule-based postprocessing based on bounding box coordinates.

### 3. One-Class Method

All quadrants were labeled as a single class.

Each quadrant was then assigned to its correct anatomical position using rule-based postprocessing based on bounding box coordinates.

The original images were cropped with an additional margin to ensure that all related teeth were included. These cropped quadrant images were used as inputs for the enumeration models.

The best-performing quadrant method was selected for the next stage.

---

## Tooth Enumeration Model

The tooth enumeration model performed object detection and labeled each tooth using FDI notation.

Each quadrant could appear in one of four different orientations. To reduce variation, the researchers used two strategies:

1. Right quadrants were horizontally flipped to match the orientation of left quadrants.
2. Two separate enumeration models were trained:
   - One for upper quadrants.
   - One for lower quadrants.

Separate Faster R-CNN models were trained for the upper and lower jaws.

After enumeration, the flipped quadrants were returned to their original orientation.

---

## Training

All model architecture and optimization procedures were developed in Python using the Detectron2 library.<sup>20</sup>

### Hardware

- NVIDIA Tesla K80 GPU.
- 12 GB GDDR5 VRAM.
- Intel Xeon processor with two cores at 2.20 GHz.
- 13 GB RAM.

### Training Parameters

- **Initial learning rate:** 0.001.
- **Learning rate schedule:** Exponential decay.
- **Batch size:** 128.
- **Iterations:** 700 for quadrant and tooth detection models.
- **Hyperparameter tuning:** Grid search.
- **Parameters tuned:** Batch size, learning rate, and optimizer.
- **Overfitting prevention:** Early stopping based on validation AP.

The best model weights were saved according to their average precision on the validation dataset.

---

## Evaluation

The following metrics were used:

- Intersection-over-union (IoU).
- Precision.
- Recall.
- Average precision (AP).
- Average recall (AR).

### Intersection-over-Union

IoU measures the overlap between the ground-truth bounding box and the predicted bounding box.

\[
IoU = \frac{|A \cap B|}{|A \cup B|}
\]

Where:

- \(A\) is the ground-truth bounding box.
- \(B\) is the predicted bounding box.

An IoU threshold \(t\) was used to determine whether an object was correctly detected.

- **True positive (TP):** IoU > \(t\).
- **False positive (FP):** IoU < \(t\).
- **False negative (FN):** A ground-truth object is present, but the model fails to detect it.

### Precision

\[
Precision(t) = \frac{TP(t)}{TP(t) + FP(t)}
\]

### Recall

\[
Recall(t) = \frac{TP(t)}{TP(t) + FN(t)}
\]

### Average Precision

Average precision was calculated from 11 interpolated points on the precision-recall curve.

\[
AP = \frac{1}{11}\sum_i Precision(Recall_i)
\]

The recall values were divided into 11 points between 0.5 and 1.0.

### Average Recall

\[
AR = 2 \int_{0.5}^{1} recall(t)\,d(t)
\]

Where \(t\) represents IoU thresholds between 50% and 100%.

---

# Results

## Dataset Description

The distribution of individual teeth in the image dataset is shown in Figure 1.

Mandibular incisors and canines were the most frequently observed teeth, whereas maxillary third molars were the least frequently observed.

### Figure 1. Tooth Distribution by FDI Numbering System

The figure presents the number of samples for each tooth according to the FDI system:

- 11-18: Upper right teeth 1-8.
- 21-28: Upper left teeth 1-8.
- 31-38: Lower left teeth 1-8.
- 41-48: Lower right teeth 1-8.

Tooth types:

1. Central incisor.
2. Lateral incisor.
3. Canine.
4. First premolar.
5. Second premolar.
6. First molar.
7. Second molar.
8. Third molar.

---

## Quadrant Detection Model

The quadrant detection model performed better when fewer classes were used.

Both the two-class and one-class methods achieved an AP50 of 100%.

### Table 1. Object Detection Metrics for the Quadrant Detection Task

| Method | Area | Maximum detections | AP (50:95) | AR (50:95) | AP50 (%) |
|---|---:|---:|---:|---:|---:|
| 4 class | All | 100 | 0.707 | 0.841 | 88.572 |
| 4 class | Medium | 100 | 1.000 | 1.000 | — |
| 4 class | Large | 100 | 0.707 | 0.841 | — |
| 2 class | All | 100 | 0.809 | 0.851 | 100.0 |
| 2 class | Medium | 100 | 1.000 | 1.000 | — |
| 2 class | Large | 100 | 0.809 | 0.851 | — |
| 1 class | All | 100 | 0.817 | 0.860 | 100.0 |
| 1 class | Medium | 100 | 1.000 | 1.000 | — |
| 1 class | Large | 100 | 0.817 | 0.860 | — |

**Abbreviations:**

- **IoU:** Intersection-over-union.
- **AP:** Average precision.
- **AR:** Average recall.
- **AP (50:95):** AP for bounding boxes with IoU thresholds between 50% and 95%.
- **AR (50:95):** AR for bounding boxes with IoU thresholds between 50% and 95%.
- **AP50:** AP for bounding boxes with IoU greater than 50%.

### Figure 2. Quadrant Detection Output

The figure shows outputs from the quadrant detection model before applying postprocessing.

---

## Tooth Enumeration Model

The outputs of the tooth enumeration model included:

- Tooth number.
- Prediction confidence.

The AP50 values were:

- **Upper quadrants:** 95.93%.
- **Lower quadrants:** 95.05%.

### Table 2. Object Detection Metrics for Tooth Enumeration

| Method | Area | Maximum detections | AP (50:95) | AR (50:95) | AP50 (%) | AP75 (%) |
|---|---:|---:|---:|---:|---:|---:|
| Upper quadrants | All | 100 | 0.725 | 0.804 | 95.93 | 92.07 |
| Upper quadrants | Medium | 100 | -1.000 | -1.000 | — | — |
| Upper quadrants | Large | 100 | 0.725 | 0.804 | — | — |
| Lower quadrants | All | 100 | 0.727 | 0.816 | 95.05 | 88.51 |
| Lower quadrants | Medium | 100 | 0.664 | 0.686 | — | — |
| Lower quadrants | Large | 100 | 0.727 | 0.815 | — | — |

### Figure 3. Tooth Enumeration Output

- **Figure 3a:** Output from the lower-quadrant enumeration model.
- **Figure 3b:** Output from the upper-quadrant enumeration model.

Each bounding box contains the predicted tooth number and model confidence.

---

## Average Precision by Tooth Class

The mandibular first molars had the highest AP, while mandibular lateral incisors had the lowest AP.

### Table 3. Average Precision for Each Tooth Class

| Tooth class | AP upper quadrants (%) | Tooth class | AP lower quadrants (%) |
|---:|---:|---:|---:|
| 1 | 74.37 | 1 | 72.73 |
| 2 | 72.98 | 2 | 60.84 |
| 3 | 72.18 | 3 | 73.14 |
| 4 | 66.47 | 4 | 70.45 |
| 5 | 70.78 | 5 | 66.01 |
| 6 | 77.37 | 6 | 84.09 |
| 7 | 75.06 | 7 | 82.74 |
| 8 | 70.64 | 8 | 75.72 |

---

## End-to-End Baseline Model

The one-step end-to-end approach produced substantially lower performance than the two-step method.

### Table 4. Performance of the End-to-End Tooth Enumeration Model

| Metric | End-to-end approach (%) |
|---|---:|
| AP50 | 43.77 |
| AP75 | 38.59 |
| AP | 31.19 |
| AP for large instances | 31.14 |
| AP for medium instances | 56.25 |

---

# Discussion

Tooth enumeration and dental charting are the first steps in dental procedures and are important for producing accurate treatment plans.

Dental charting is critical for:

- Diagnosis.
- Management.
- Referrals.
- Treatment.

Because dental diseases are directly related to teeth or occur near them, initial charting forms the foundation for subsequent dental procedures.<sup>5</sup>

Tooth identification and numbering are therefore important because they form the basis for more complex AI-based tasks in dental radiographic images. Automatic tooth identification using digital images is an important component of intelligent health care.<sup>9,10,16,21</sup>

AI-based dental charting has been studied using:

- Cone-beam computed tomography.
- Bitewing radiographs.
- Periapical radiographs.<sup>11,12,22,23</sup>

Panoramic radiography is considered particularly suitable for charting because it provides an overview of the entire dentition in a single image with a relatively low radiation dose.<sup>7</sup>

Several studies have evaluated automatic tooth numbering in panoramic radiographs. However, the results of some earlier studies should be interpreted cautiously because AP and predefined IoU thresholds were not reported.<sup>9,13,14,16,24</sup>

AP is a standard metric in object detection that is derived from precision and recall. Because bounding boxes are defined in two-dimensional space, a predefined IoU threshold is required to distinguish true predictions from false predictions. AP is therefore commonly reported at IoU thresholds of 0.5 and 0.75.

Tuzoff et al. relied on expert judgment to evaluate model predictions, which may introduce individual bias.<sup>9</sup> Some earlier studies also simplified tooth classification into only:

- Four categories: Incisor, canine, premolar, and molar.
- Three categories: Incisor, canine, and molar.<sup>6,13</sup>

The end-to-end single-step approach in the present study produced unsatisfactory results. The researchers therefore implemented a two-step approach similar to that used by Yüksel et al.<sup>15</sup>

The difference was that Yüksel et al. used segmentation for quadrant detection, whereas the present study used object detection in both stages.

Yüksel et al. reported an AP of 89.4% for tooth enumeration.<sup>15</sup> Chung et al. used one-step point-wise localization and distance regularization rather than an anchor-based method. Their model achieved an AP of 91%.<sup>25</sup>

The current study achieved approximately **95% AP50** for tooth enumeration, representing an improvement over those earlier studies.

---

## Limitations

A major limitation was the exclusion of radiographs from children with deciduous teeth.

Because dentition changes rapidly during childhood, large quantities of annotated radiographs are needed for every stage of dental development.

Future studies should include panoramic radiographs from children with mixed dentition because accurate numbering and charting are particularly important in extraction cases.

Future datasets should also include:

- Retained roots.
- Supernumerary teeth.
- Impacted teeth.
- Implants.

Including these conditions would improve dataset diversity and model generalizability.

---

# Conclusion

The researchers proposed a two-step deep learning framework for automatic tooth enumeration in panoramic radiographs.

The framework achieved promising AP and recall values. Further studies are required using more diverse datasets and real-life clinical settings.

---

## Financial Support and Sponsorship

Nil.

## Conflicts of Interest

The authors declared no real or perceived financial or non-financial conflicts of interest.

---

# References

1. Schwendicke F, Samek W, Krois J. Artificial intelligence in dentistry: Chances and challenges. *J Dent Res*. 2020;99:769-74.
2. LeCun Y, Bengio Y, Hinton G. Deep learning. *Nature*. 2015;521:436-44.
3. Yamashita R, Nishio M, Do RK, Togashi K. Convolutional neural networks: An overview and application in radiology. *Insights Imaging*. 2018;9:611-29.
4. Cantu AG, Gehrung S, Krois J, Chaurasia A, Rossi JG, Gaudin R, et al. Detecting caries lesions of different radiographic extension on bitewings using deep learning. *J Dent*. 2020;100:103425.
5. Umer F, Habib S, Adnan N. Application of deep learning in teeth identification tasks on panoramic radiographs. *Dentomaxillofac Radiol*. 2022;51:20210504.
6. Kim C, Kim D, Jeong H, Yoon SJ, Youm S. Automatic tooth detection and numbering using a combination of a CNN and heuristic algorithm. *Appl Sci*. 2020;10:5624.
7. Terlemez A, Tassoker M, Kizilcakaya M, Gulec M. Comparison of cone-beam computed tomography and panoramic radiography in the evaluation of maxillary sinus pathology related to maxillary posterior teeth: Do apical lesions increase the risk of maxillary sinus pathology? *Imaging Sci Dent*. 2019;49:115-22.
8. Heinrich A, Güttler F, Wendt S, Schenkl S, Hubig M, Wagner R, et al. Forensic Odontology: Automatic identification of persons comparing antemortem and postmortem panoramic radiographs using computer vision. *Rofo*. 2018;190:1152-8.
9. Tuzoff DV, Tuzova LN, Bornstein MM, Krasnov AS, Kharchenko MA, Nikolenko SI, et al. Tooth detection and numbering in panoramic radiographs using convolutional neural networks. *Dentomaxillofac Radiol*. 2019;48:20180051.
10. Chen H, Zhang K, Lyu P, Li H, Zhang L, Wu J, et al. A deep learning approach to automatic teeth detection and numbering based on object detection in dental periapical films. *Sci Rep*. 2019;9:3840.
11. Görürgöz C, Orhan K, Bayrakdar IS, Çelik Ö, Bilgir E, Odabaş A, et al. Performance of a convolutional neural network algorithm for tooth detection and numbering on periapical radiographs. *Dentomaxillofac Radiol*. 2022;51:20210246.
12. Yasa Y, Çelik Ö, Bayrakdar IS, Pekince A, Orhan K, Akarsu S, et al. An artificial intelligence proposal to automatic teeth detection and numbering in dental bite-wing radiographs. *Acta Odontol Scand*. 2021;79:275-81.
13. Muramatsu C, Morishita T, Takahashi R, Hayashi T, Nishiyama W, Ariji Y, et al. Tooth detection and classification on panoramic radiographs for automatic dental chart filing: Improved classification by multi-sized input data. *Oral Radiol*. 2021;37:13-9.
14. Prados-Privado M, García Villalón J, Blázquez Torres A, Martínez-Martínez CH, Ivorra C. A convolutional neural network for automatic tooth numbering in panoramic images. *Biomed Res Int*. 2021;2021:3625386.
15. Yüksel AE, Gültekin S, Simsar E, Özdemir ŞD, Gündoğar M, Tokgöz SB, et al. Dental enumeration and multiple treatment detection on panoramic X-rays using deep learning. *Sci Rep*. 2021;11:12342.
16. Bilgir E, Bayrakdar İŞ, Çelik Ö, Orhan K, Akkoca F, Sağlam H, et al. An artificial intelligence approach to automatic tooth detection and numbering in panoramic radiographs. *BMC Med Imaging*. 2021;21:124.
17. Mongan J, Moy L, Kahn CE Jr. Checklist for artificial intelligence in medical imaging (CLAIM): A guide for authors and reviewers. *Radiol Artif Intell*. 2020;2:e200029.
18. Jader G, Fontineli J, Ruiz M, Abdalla K, Pithon M, Oliveira L, editors. Deep Instance Segmentation of Teeth in Panoramic X-Ray Images. Parana, Brazil: SIBGRAPI; 2018. p. 400-7.
19. Tzutalin. LabelImg. Git Code; 2015. Available from: GitHub. Last accessed 10 December 2022.
20. Wu Y, Kirillov A, Massa F, Lo WY, Girshick R. Detectron2; 2019. Available from: GitHub. Last accessed 10 January 2023.
21. Yuniarti A, Nugroho A, Amaliah B, Arifin AZ. Classification and numbering of dental radiographs for an automated human identification system. *TELKOMNIKA*. 2012;10:137-46.
22. Hosntalab M, Aghaeizadeh Zoroofi R, Abbaspour Tehrani-Fard A, Shirani G. Classification and numbering of teeth in multi-slice CT images using wavelet-Fourier descriptor. *Int J Comput Assist Radiol Surg*. 2010;5:237-49.
23. Yaren Tekin B, Ozcan C, Pekince A, Yasa Y. An enhanced tooth segmentation and numbering according to FDI notation in bitewing radiographs. *Comput Biol Med*. 2022;146:105547.
24. Estai M, Tennant M, Gebauer D, Brostek A, Vignarajan J, Mehdizadeh M, et al. Deep learning for automated detection and numbering of permanent teeth on panoramic images. *Dentomaxillofac Radiol*. 2022;51:20210296.
25. Chung M, Lee J, Park S, Lee M, Lee CE, Lee J, et al. Individual tooth detection and identification from dental panoramic X-ray images via point-wise localization and distance regularization. *Artif Intell Med*. 2021;111:101996.
