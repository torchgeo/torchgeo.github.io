"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type Tok = [
  "kw" | "fn" | "cls" | "str" | "num" | "com" | "mod" | "prop",
  string,
];

type Sample = {
  key: string;
  tab: string;
  file: string;
  title: string;
  desc: ReactNode;
  bullets: [string, string][];
  cmd: string;
  okLine: string;
  code: Tok[][];
};

const SAMPLES: Sample[] = [
  {
    key: "classify",
    tab: "classification",
    file: "eurosat",
    title: "Land-cover classification on EuroSAT.",
    desc: (
      <>
        A Sentinel-2-pretrained ResNet-18 fine-tuned on EuroSAT. The sampler
        yields windows in the dataset's native CRS; the dataloader is a stock{" "}
        <code>torch.utils.data.DataLoader</code>.
      </>
    ),
    bullets: [
      ["CRS-aware", "windows align to the dataset CRS, not array indices."],
      ["13-band input", "Sentinel-2 MSI, no RGB workaround."],
      ["Pretrained weights", "SeCo, MoCo, MAE, DOFA, DINO-v2."],
    ],
    cmd: "python eurosat.py --epochs 50",
    okLine: "Loaded · Sentinel-2 · 13 bands · 64×64",
    code: [
      [["com", "# Fresh interpreter to a fine-tuned Sentinel-2 ResNet-18."]],
      [
        ["mod", "from "],
        ["cls", "torchgeo.datamodules"],
        ["mod", " import "],
        ["cls", "EuroSATDataModule"],
      ],
      [
        ["mod", "from "],
        ["cls", "torchgeo.models"],
        ["mod", "      import "],
        ["cls", "ResNet18_Weights"],
      ],
      [
        ["mod", "from "],
        ["cls", "torchgeo.trainers"],
        ["mod", "    import "],
        ["cls", "ClassificationTask"],
      ],
      [
        ["mod", "from "],
        ["cls", "lightning.pytorch"],
        ["mod", "  import "],
        ["fn", "Trainer"],
      ],
      [],
      [
        ["kw", "dm "],
        ["mod", "= "],
        ["fn", "EuroSATDataModule"],
        ["mod", "("],
        ["prop", "root"],
        ["mod", "="],
        ["str", '"./data"'],
        ["mod", ", "],
        ["prop", "batch_size"],
        ["mod", "="],
        ["num", "64"],
        ["mod", ", "],
        ["prop", "download"],
        ["mod", "="],
        ["kw", "True"],
        ["mod", ")"],
      ],
      [
        ["kw", "task "],
        ["mod", "= "],
        ["fn", "ClassificationTask"],
        ["mod", "("],
      ],
      [
        ["mod", "    "],
        ["prop", "model"],
        ["mod", "="],
        ["str", '"resnet18"'],
        ["mod", ", "],
        ["prop", "weights"],
        ["mod", "="],
        ["cls", "ResNet18_Weights"],
        ["mod", "."],
        ["kw", "SENTINEL2_ALL_MOCO"],
        ["mod", ","],
      ],
      [
        ["mod", "    "],
        ["prop", "in_channels"],
        ["mod", "="],
        ["num", "13"],
        ["mod", ", "],
        ["prop", "num_classes"],
        ["mod", "="],
        ["num", "10"],
        ["mod", ","],
      ],
      [["mod", ")"]],
      [],
      [
        ["fn", "Trainer"],
        ["mod", "("],
        ["prop", "max_epochs"],
        ["mod", "="],
        ["num", "50"],
        ["mod", ", "],
        ["prop", "accelerator"],
        ["mod", "="],
        ["str", '"gpu"'],
        ["mod", ")."],
        ["fn", "fit"],
        ["mod", "(task, "],
        ["prop", "datamodule"],
        ["mod", "=dm)"],
      ],
    ],
  },
  {
    key: "segment",
    tab: "segmentation",
    file: "inria",
    title: "Building-footprint segmentation on Inria.",
    desc: (
      <>
        Pixel-wise binary segmentation on 0.3 m aerial imagery. A U-Net with a
        SeCo-pretrained ResNet-50 encoder reaches strong IoU in fewer than 30
        epochs.
      </>
    ),
    bullets: [
      ["Native rasters", "reads GeoTIFFs as-is; no pre-chipping required."],
      [
        "Spatial sampler",
        "GridGeoSampler walks a regular grid in the dataset CRS.",
      ],
      ["Composable trainer", "swap the backbone with one keyword."],
    ],
    cmd: "python inria.py --epochs 30",
    okLine: "Loaded · aerial RGB · 0.3 m/px · 5000×5000",
    code: [
      [["com", "# Pixel-wise segmentation — same shape, different head."]],
      [
        ["mod", "from "],
        ["cls", "torchgeo.datamodules"],
        ["mod", " import "],
        ["cls", "InriaAerialImageLabelingDataModule"],
      ],
      [
        ["mod", "from "],
        ["cls", "torchgeo.models"],
        ["mod", "      import "],
        ["cls", "ResNet50_Weights"],
      ],
      [
        ["mod", "from "],
        ["cls", "torchgeo.trainers"],
        ["mod", "    import "],
        ["cls", "SemanticSegmentationTask"],
      ],
      [
        ["mod", "from "],
        ["cls", "lightning.pytorch"],
        ["mod", "  import "],
        ["fn", "Trainer"],
      ],
      [],
      [
        ["kw", "dm "],
        ["mod", "= "],
        ["fn", "InriaAerialImageLabelingDataModule"],
        ["mod", "("],
      ],
      [
        ["mod", "    "],
        ["prop", "root"],
        ["mod", "="],
        ["str", '"./data"'],
        ["mod", ", "],
        ["prop", "batch_size"],
        ["mod", "="],
        ["num", "32"],
        ["mod", ", "],
        ["prop", "patch_size"],
        ["mod", "="],
        ["num", "512"],
        ["mod", ","],
      ],
      [["mod", ")"]],
      [
        ["kw", "task "],
        ["mod", "= "],
        ["fn", "SemanticSegmentationTask"],
        ["mod", "("],
      ],
      [
        ["mod", "    "],
        ["prop", "model"],
        ["mod", "="],
        ["str", '"unet"'],
        ["mod", ", "],
        ["prop", "backbone"],
        ["mod", "="],
        ["str", '"resnet50"'],
        ["mod", ","],
      ],
      [
        ["mod", "    "],
        ["prop", "weights"],
        ["mod", "="],
        ["cls", "ResNet50_Weights"],
        ["mod", "."],
        ["kw", "SENTINEL2_RGB_MOCO"],
        ["mod", ","],
      ],
      [
        ["mod", "    "],
        ["prop", "in_channels"],
        ["mod", "="],
        ["num", "3"],
        ["mod", ", "],
        ["prop", "num_classes"],
        ["mod", "="],
        ["num", "2"],
        ["mod", ", "],
        ["prop", "loss"],
        ["mod", "="],
        ["str", '"jaccard"'],
        ["mod", ","],
      ],
      [["mod", ")"]],
      [
        ["fn", "Trainer"],
        ["mod", "("],
        ["prop", "max_epochs"],
        ["mod", "="],
        ["num", "30"],
        ["mod", ", "],
        ["prop", "accelerator"],
        ["mod", "="],
        ["str", '"gpu"'],
        ["mod", ")."],
        ["fn", "fit"],
        ["mod", "(task, "],
        ["prop", "datamodule"],
        ["mod", "=dm)"],
      ],
    ],
  },
  {
    key: "detect",
    tab: "detection",
    file: "vhr10",
    title: "Object detection on NWPU VHR-10.",
    desc: (
      <>
        Faster R-CNN with a ResNet-50 backbone over ten classes — courts,
        harbors, vehicles, ships. Same trainer, different head.
      </>
    ),
    bullets: [
      ["10 classes", "baseball diamonds, tennis courts, harbors, planes…"],
      ["Faster R-CNN", "bounding-box detector, no mask head."],
      ["Detection trainer", "mAP, IoU, F1 logged out of the box."],
    ],
    cmd: "python vhr10.py --epochs 25",
    okLine: "Loaded · VHR aerial RGB · 10 classes · 800 scenes",
    code: [
      [["com", "# Object detection on very-high-resolution aerial imagery."]],
      [
        ["mod", "from "],
        ["cls", "torchgeo.datamodules"],
        ["mod", " import "],
        ["cls", "VHR10DataModule"],
      ],
      [
        ["mod", "from "],
        ["cls", "torchgeo.trainers"],
        ["mod", "   import "],
        ["cls", "ObjectDetectionTask"],
      ],
      [
        ["mod", "from "],
        ["cls", "lightning.pytorch"],
        ["mod", " import "],
        ["fn", "Trainer"],
      ],
      [],
      [
        ["kw", "dm "],
        ["mod", "= "],
        ["fn", "VHR10DataModule"],
        ["mod", "("],
        ["prop", "root"],
        ["mod", "="],
        ["str", '"./data"'],
        ["mod", ", "],
        ["prop", "batch_size"],
        ["mod", "="],
        ["num", "8"],
        ["mod", ", "],
        ["prop", "download"],
        ["mod", "="],
        ["kw", "True"],
        ["mod", ")"],
      ],
      [
        ["kw", "task "],
        ["mod", "= "],
        ["fn", "ObjectDetectionTask"],
        ["mod", "("],
      ],
      [
        ["mod", "    "],
        ["prop", "model"],
        ["mod", "="],
        ["str", '"faster-rcnn"'],
        ["mod", ", "],
        ["prop", "backbone"],
        ["mod", "="],
        ["str", '"resnet50"'],
        ["mod", ","],
      ],
      [
        ["mod", "    "],
        ["prop", "num_classes"],
        ["mod", "="],
        ["num", "11"],
        ["mod", ", "],
        ["com", "# 10 classes + background"],
      ],
      [
        ["mod", "    "],
        ["prop", "lr"],
        ["mod", "="],
        ["num", "1e-4"],
        ["mod", ", "],
        ["prop", "trainable_layers"],
        ["mod", "="],
        ["num", "3"],
        ["mod", ","],
      ],
      [["mod", ")"]],
      [
        ["fn", "Trainer"],
        ["mod", "("],
        ["prop", "max_epochs"],
        ["mod", "="],
        ["num", "25"],
        ["mod", ", "],
        ["prop", "accelerator"],
        ["mod", "="],
        ["str", '"gpu"'],
        ["mod", ")."],
        ["fn", "fit"],
        ["mod", "(task, "],
        ["prop", "datamodule"],
        ["mod", "=dm)"],
      ],
    ],
  },
  {
    key: "instance",
    tab: "instance segmentation",
    file: "vhr10_masks",
    title: "Instance segmentation on NWPU VHR-10.",
    desc: (
      <>
        Same dataset, mask head added. Mask R-CNN predicts per-instance masks
        alongside boxes — useful when objects touch or overlap.
      </>
    ),
    bullets: [
      ["Mask R-CNN", "per-instance masks + bounding boxes."],
      ["Same datamodule", "VHR-10 ships annotations for both tasks."],
      ["Instance trainer", "mAP-bbox and mAP-mask tracked separately."],
    ],
    cmd: "python vhr10_masks.py --epochs 25",
    okLine: "Loaded · VHR aerial RGB · masks + boxes · 10 classes",
    code: [
      [["com", "# Instance segmentation: same dataset, mask head added."]],
      [
        ["mod", "from "],
        ["cls", "torchgeo.datamodules"],
        ["mod", " import "],
        ["cls", "VHR10DataModule"],
      ],
      [
        ["mod", "from "],
        ["cls", "torchgeo.trainers"],
        ["mod", "   import "],
        ["cls", "InstanceSegmentationTask"],
      ],
      [
        ["mod", "from "],
        ["cls", "lightning.pytorch"],
        ["mod", " import "],
        ["fn", "Trainer"],
      ],
      [],
      [
        ["kw", "dm "],
        ["mod", "= "],
        ["fn", "VHR10DataModule"],
        ["mod", "("],
        ["prop", "root"],
        ["mod", "="],
        ["str", '"./data"'],
        ["mod", ", "],
        ["prop", "batch_size"],
        ["mod", "="],
        ["num", "8"],
        ["mod", ", "],
        ["prop", "download"],
        ["mod", "="],
        ["kw", "True"],
        ["mod", ")"],
      ],
      [
        ["kw", "task "],
        ["mod", "= "],
        ["fn", "InstanceSegmentationTask"],
        ["mod", "("],
      ],
      [
        ["mod", "    "],
        ["prop", "model"],
        ["mod", "="],
        ["str", '"mask-rcnn"'],
        ["mod", ", "],
        ["prop", "backbone"],
        ["mod", "="],
        ["str", '"resnet50"'],
        ["mod", ","],
      ],
      [
        ["mod", "    "],
        ["prop", "num_classes"],
        ["mod", "="],
        ["num", "11"],
        ["mod", ", "],
        ["prop", "lr"],
        ["mod", "="],
        ["num", "1e-4"],
        ["mod", ", "],
        ["com", "# 10 classes + bg"],
      ],
      [["mod", ")"]],
      [
        ["fn", "Trainer"],
        ["mod", "("],
        ["prop", "max_epochs"],
        ["mod", "="],
        ["num", "25"],
        ["mod", ", "],
        ["prop", "accelerator"],
        ["mod", "="],
        ["str", '"gpu"'],
        ["mod", ")."],
        ["fn", "fit"],
        ["mod", "(task, "],
        ["prop", "datamodule"],
        ["mod", "=dm)"],
      ],
    ],
  },
];

function CodeBody({ code }: { code: Tok[][] }) {
  return (
    <pre>
      {code.map((line, li) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable order
        <div key={li}>
          {line.length === 0
            ? "\u00A0"
            : line.map(([cls, txt], ti) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable order
                <span key={ti} className={`tok-${cls}`}>
                  {txt}
                </span>
              ))}
        </div>
      ))}
    </pre>
  );
}

function Terminal({ cmd, okLine }: { cmd: string; okLine: string }) {
  const [typed1, setTyped1] = useState("");
  const [typed2, setTyped2] = useState("");
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    let cancelled = false;
    let t: ReturnType<typeof setTimeout> | undefined;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setTyped1("");
    setTyped2("");
    setPhase(0);

    const typeOne = (
      text: string,
      set: (s: string) => void,
      done: () => void,
    ) => {
      if (reduce) {
        set(text);
        done();
        return;
      }
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i++;
        set(text.slice(0, i));
        if (i < text.length) t = setTimeout(tick, 28 + Math.random() * 30);
        else done();
      };
      tick();
    };

    typeOne("pip install torchgeo", setTyped1, () => {
      t = setTimeout(() => {
        if (cancelled) return;
        setPhase(1);
        t = setTimeout(() => {
          if (cancelled) return;
          setPhase(2);
          typeOne(cmd, setTyped2, () => {
            t = setTimeout(() => {
              if (cancelled) return;
              setPhase(4);
            }, 400);
          });
        }, 500);
      }, 350);
    });

    return () => {
      cancelled = true;
      if (t) clearTimeout(t);
    };
  }, [cmd]);

  return (
    <div className="terminal">
      <div className="row">
        <span className="prompt">$</span> {typed1}
        {phase === 0 ? <span className="cur" /> : null}
      </div>
      <div className="row" style={{ opacity: phase >= 1 ? 1 : 0 }}>
        <span className="out">
          Successfully installed torchgeo-1.0.0 rasterio-1.4.1 fiona-1.10.1
        </span>
      </div>
      <div className="row" style={{ opacity: phase >= 2 ? 1 : 0 }}>
        <span className="prompt">$</span> {typed2}
        {phase >= 2 && phase < 4 ? <span className="cur" /> : null}
      </div>
      <div className="row" style={{ opacity: phase >= 4 ? 1 : 0 }}>
        <span className="ok">{okLine}</span>
      </div>
    </div>
  );
}

export function CodeTabs() {
  const [activeKey, setActiveKey] = useState(SAMPLES[0].key);
  const active = SAMPLES.find((s) => s.key === activeKey) ?? SAMPLES[0];
  // Force-remount the terminal when tab changes so the typing animation restarts
  const termKey = useRef(0);
  termKey.current += 1;

  return (
    <div className="codeblock">
      <div className="codeblock__copy">
        <span className="eyebrow">torchgeo · API</span>
        <h3>{active.title}</h3>
        <p>{active.desc}</p>
        <ul>
          {active.bullets.map(([b, t]) => (
            <li key={b}>
              <span>
                <b>{b}</b> — {t}
              </span>
            </li>
          ))}
        </ul>
        <Terminal
          key={`term-${active.key}`}
          cmd={active.cmd}
          okLine={active.okLine}
        />
      </div>

      <div>
        <div className="tabs" role="tablist">
          {SAMPLES.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`tab ${s.key === activeKey ? "is-active" : ""}`}
              onClick={() => setActiveKey(s.key)}
              role="tab"
              aria-selected={s.key === activeKey}
            >
              {s.tab}
            </button>
          ))}
        </div>

        <div className="code-card">
          <div className="code-card__chrome">
            <span className="code-card__dots">
              <span />
              <span />
              <span />
            </span>
            <span className="code-card__file">
              {active.file}
              <span className="ext">.py</span>
            </span>
            <span className="code-card__pill">runs as-is</span>
          </div>
          <div className="code-card__body">
            <CodeBody code={active.code} />
          </div>
        </div>
      </div>
    </div>
  );
}
