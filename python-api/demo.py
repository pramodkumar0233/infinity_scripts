from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForQuestionAnswering, TrainingArguments, Trainer
from transformers import default_data_collator

# Load SQuAD from local JSON files
data_files = {
    "train": "train-v1.1.json",
    "validation": "dev-v1.1.json"
}
dataset = load_dataset("json", data_files=data_files, field="data")

# ✅ Only add start and end positions
def add_token_positions(example):
    example["start_positions"] = example["answers"]["answer_start"][0]
    example["end_positions"] = example["start_positions"] + len(example["answers"]["text"][0])
    return example

dataset = dataset.map(add_token_positions)


# Tokenization
model_checkpoint = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_checkpoint)

def prepare_features(examples):
    tokenized = tokenizer(
        examples["question"],
        examples["context"],
        truncation="only_second",
        max_length=384,
        stride=128,
        return_overflowing_tokens=True,
        return_offsets_mapping=True,
        padding="max_length"
    )

    sample_mapping = tokenized.pop("overflow_to_sample_mapping")
    offset_mapping = tokenized.pop("offset_mapping")

    start_positions = []
    end_positions = []

    for i, offsets in enumerate(offset_mapping):
        input_ids = tokenized["input_ids"][i]
        cls_index = input_ids.index(tokenizer.cls_token_id)
        sequence_ids = tokenized.sequence_ids(i)
        sample_index = sample_mapping[i]
        answers = examples["answers"][sample_index]
        start_char = answers["answer_start"]
        end_char = start_char + len(answers["text"])
        context = examples["context"][sample_index]

        token_start_index = 0
        while sequence_ids[token_start_index] != 1:
            token_start_index += 1
        token_end_index = len(input_ids) - 1
        while sequence_ids[token_end_index] != 1:
            token_end_index -= 1

        if not (start_char >= 0 and end_char <= len(context)):
            start_positions.append(cls_index)
            end_positions.append(cls_index)
            continue

        start_token = cls_index
        end_token = cls_index

        for idx in range(token_start_index, token_end_index + 1):
            start, end = offsets[idx]
            if start <= start_char < end:
                start_token = idx
            if start < end_char <= end:
                end_token = idx
                break

        start_positions.append(start_token)
        end_positions.append(end_token)

    tokenized["start_positions"] = start_positions
    tokenized["end_positions"] = end_positions
    return tokenized

tokenized_datasets = dataset.map(prepare_features, batched=True, remove_columns=dataset["train"].column_names)

# Model
model = AutoModelForQuestionAnswering.from_pretrained(model_checkpoint)

# Training
args = TrainingArguments(
    "custom-qa-model",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=2,
    weight_decay=0.01,
    save_strategy="epoch",
    logging_dir="./logs"
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    tokenizer=tokenizer,
    data_collator=default_data_collator
)

# Start Training
trainer.train()

# Save Model
trainer.save_model("custom-qa-model")
tokenizer.save_pretrained("custom-qa-model")
