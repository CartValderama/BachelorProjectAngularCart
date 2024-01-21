import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { IFlashcard } from "../models/flashcard";
import { FlashcardService } from "../services/flashcard.service";

@Component({
  selector: "app-flashcard-flashcardform",
  templateUrl: "./flashcardform.component.html"
})

export class FlashcardformComponent implements OnInit {
  // Component properties
  flashcardForm: FormGroup;
  isEditMode: boolean = false;
  flashcardId: number = -1;
  deckId: number = -1;
  flashcard: IFlashcard = {
    FlashcardId: 0,
    Question: "",
    Answer: "",
    CreationDate: "",
    DeckId: 0
  };

  // Constructor to initialize the form and inject services
  constructor(
    private _formbuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _flashcardService: FlashcardService
  ) {
    // Create the form with default values and validation rules
    this.flashcardForm = _formbuilder.group({
      question: ["", [
        Validators.required,
        Validators.maxLength(120)
      ]],
      answer: ["", [
        Validators.required,
        Validators.maxLength(120)
      ]],
      deckId: null
    });
  }

  // Method to fetch the deck ID based on the flashcard ID
  getDeckId(): void {
    this._flashcardService.getFlashcardById(this.flashcardId)
      .subscribe(data => {
        this.flashcard = data;
        this.deckId = this.flashcard.DeckId;
      });
  }

  // Method triggered on form submission
  onSubmit() {
    const newFlashcard = this.flashcardForm.value;
    newFlashcard.deckId = this.deckId;

    if (this.isEditMode) {
      // Update existing flashcard
      this._flashcardService.updateFlashcard(this.flashcardId, newFlashcard)
        .subscribe(response => {
          if (response.success) {
            this._router.navigate(["/deck/" + this.deckId]);
          } else {
            console.log("Flashcard update failed");
          }
        });
    } else {
      // Create a new flashcard
      this._flashcardService.createFlashcard(this.deckId, newFlashcard)
        .subscribe(response => {
          if (response.success) {
            this._router.navigate(["/deck/" + this.deckId]);
          } else {
            console.log("Flashcard creation failed");
          }
        });
    }
  }

  // Method to navigate back to the flashcards of the current deck
  backToFlashcards() {
    this._router.navigate(["/deck/" + this.deckId]);
  }

  // Lifecycle method called when the component is initialized
  ngOnInit(): void {
    this._route.params.subscribe(params => {
      if (params["mode"] === "create") {
        this.deckId = params["id"];
        this.isEditMode = false; // Create mode
      } else if (params["mode"] === "update") {
        this.flashcardId = params["id"];
        this.isEditMode = true; // Edit mode
        this.loadItemForEdit(params["id"]);
        this.getDeckId();
      }
    });

    this.validationFlashcard();
  }

  // Method to load a flashcard for editing
  loadItemForEdit(flashcardId: number): void {
    // Call the getFlashcardById method of the flashcard service to fetch flashcard details.
    this._flashcardService.getFlashcardById(flashcardId)
      .subscribe({
        // Success callback (next): Invoked when flashcard details are successfully retrieved.
        next: (flashcard: any) => {
          // Update the flashcardForm with the retrieved flashcard details.
          this.flashcardForm.patchValue({
            question: flashcard.Question,
            answer: flashcard.Answer
          });
        },
        // Error callback: Invoked when an error occurs during the fetch operation.
        error: (error: any) => {
          console.error("Error loading flashcard for edit: ", error);
        }
      });
  }

  // Method for flashcard validation
  validationFlashcard() {
    const question: HTMLInputElement | null = document.getElementById("question") as HTMLInputElement;
    const answer: HTMLInputElement | null = document.getElementById("answer") as HTMLInputElement;

    const validationQuestion: HTMLElement | null = document.getElementById("validationQuestion");
    const validationAnswer: HTMLElement | null = document.getElementById("validationAnswer");

    if (validationQuestion) {
      validationQuestion.style.display = "none";
    }

    if (validationAnswer) {
      validationAnswer.style.display = "none";
    }

    if (validationQuestion && question && validationAnswer && answer) {
      question.addEventListener("input", () => {
        validationQuestion.style.display = "block";
      });

      answer.addEventListener("input", () => {
        validationAnswer.style.display = "block";
      });

      setTimeout(() => {
        validationAnswer.style.display = "block";
        validationQuestion.style.display = "block";
      }, 10000);
    }
  }
}
