package evilhangman;
import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;
import java.util.concurrent.ThreadLocalRandom;

import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.GridPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;
import javafx.scene.text.Text;
import javafx.stage.Stage;

//Written by Gideon "oh god why won't this code work" Roberts
//Basic structure provided by https://canvas.instructure.com/courses/838512/assignments/2976723

public class EvilHangman extends Application {
	
	public static String getPattern(String word, String letter) {//Takes a word and letter, returns the relevant pattern.
		String[] pattern = new String[word.length()];
		if (word != "" && word != null) {
			String[] stringarray = word.split("");
			String result;
			for (int i=0;i<stringarray.length;i++) {
				if (stringarray[i].equals(letter)) { pattern[i] = stringarray[i]; }
				else pattern[i] = "-";
			}
			result = String.join("", pattern); //Helped here by https://www.geeksforgeeks.org/java-string-join-examples/
			return result;
		}
		return null;
	}
	public static String[] getPatterns(String[] words, String letter) {//Loops through the list of words and compiles a list of all possible unique patterns.
		//String[] patterns = new String[];
		ArrayList<String> patterns =new ArrayList<String>();
		for (String str : words) {
			Boolean inlist = false;
			String pattern = getPattern(str, letter);
			for (String p : patterns) {
				if(p.matches("(?i)("+pattern+").*")) {
					inlist = true;
				}
			}
			if(inlist == false) { patterns.add(pattern); }
		}
		String[] patternarr = new String[patterns.size()];
		patternarr = patterns.toArray(patternarr);
		return patternarr;
	}
	public static String[][] getPartitions(String[] words, String[] patterns, String letter) {//Composes a list of words based on each pattern.
		String[][] wordLists = new String[patterns.length][];
		for(int i=0;i<patterns.length;i++) {
			ArrayList<String> patternmatch = new ArrayList<String>();
			for (String word : words) {
				if (getPattern(word, letter).equals(patterns[i])) {
					patternmatch.add(word);
				}
			}
			String[] patternarr = new String[patternmatch.size()];
			patternarr = patternmatch.toArray(patternarr);
			wordLists[i] = patternarr;
		}
		return wordLists;
	} 	
	public static String[] getLargestRemaining(String[][] wordLists) {//Returns the largest of a list of stringlists.
		String[] result = new String[0];
		for (String[] strlst : wordLists) {
			if (strlst.length > result.length) { result = strlst; } 
		}
		return result;
	}
	public static String[] getDictionary(String filename) {//Returns the entire dictionary.
		try {
			Scanner fileScanner = new Scanner(new File(filename));
			String[] words = new String[Integer.parseInt(fileScanner.nextLine())];
			int i = 0;
			while(fileScanner.hasNextLine()) {
				words[i] = fileScanner.nextLine();
				i++;				
			}
			fileScanner.close();
			return words;
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		return null;
	}
	public static String[] getDictionaryByNum(String filename, int size) {//Returns every word in the dictionary of length size.
		String[] words = getDictionary(filename);
		ArrayList<String> sizedwords =new ArrayList<String>();

		for (String word : words) {
			if (word != null && word.length() == size) { sizedwords.add(word); }
		}

		String[] sizedarr = new String[sizedwords.size()];
		sizedarr = sizedwords.toArray(sizedarr);
		return sizedarr;
	}	
	public static String[] getWordList(String filename, int size, String letter) {//Simplifies the calls to all the other functions. Returns the largest list of words of length size with a common pattern.
		return getLargestRemaining(getPartitions(getDictionaryByNum(filename, size), getPatterns(getDictionaryByNum(filename, size), letter), letter));
	}	
	public static String updatePattern(String pattern, String word, String letter) {//Takes the old pattern and updates it with a new letter/word.
		String[] newpattern = new String[word.length()];
		String[] patternarr = pattern.split("");
		if (word != "" && word != null) {
			String[] stringarray = word.split("");
			String result;
			for (int i=0;i<stringarray.length;i++) {
				if (stringarray[i].equals(letter)) { newpattern[i] = stringarray[i]; }
				else if (patternarr[i].equals("-")) { newpattern[i] = "-"; }
				else { newpattern[i] = stringarray[i]; }
			}
			result = String.join("", newpattern);
			return result;
		}
		return null;
	}
	public static String[] updatePatterns(String pattern, String letter, String[] words) {//Makes a new list of patterns based on a new letter and the old pattern.
		ArrayList<String> patterns =new ArrayList<String>();
		for (String str : words) {
			Boolean inlist = false;
			String newpattern = updatePattern(pattern, str, letter);
			for (String p : patterns) {
				if(p.matches("(?i)("+newpattern+").*")) {
					inlist = true;
				}
			}
			if(inlist == false) { patterns.add(newpattern); }
		}
		String[] patternarr = new String[patterns.size()];
		patternarr = patterns.toArray(patternarr);
		return patternarr;
	}
	public static String[][] updatePartitions(String[] words, String[] patterns, String letter, String pattern) {//Composes a list of words based on each pattern.
		String[][] wordLists = new String[patterns.length][];
		for(int i=0;i<patterns.length;i++) {
			ArrayList<String> patternmatch = new ArrayList<String>();
			for (String word : words) {
				if (updatePattern(pattern, word, letter).equals(patterns[i])) {
					patternmatch.add(word);
				}
			}
			String[] patternarr = new String[patternmatch.size()];
			patternarr = patternmatch.toArray(patternarr);
			wordLists[i] = patternarr;
		}
		return wordLists;
	} 	
	public static String[] updateWordList(String[] words, String letter, String pattern) {//Same as getWordList, but updates it this time.
		return getLargestRemaining(updatePartitions(words, updatePatterns(pattern, letter, words), letter, pattern));
	}
	TextField guess; //Functional buttons/fields
	Button submit;
	TextField size;
	Button start;
	Text guessedLetters;
	TextField firstGuess;
	Text solution;
	Text status;
	Text remainingGuesses;
	CheckBox unlimitedGuesses;
	
	Circle head; //Stickman drawing, unfinished as of now
	Line body;
	Line armL;
	Line armR;
	Line legL;
	Line legR;
	Circle handL;
	Circle handR;
	Circle footL;
	Circle footR;
	Line eyeL1;
	Line eyeL2;
	Line eyeR1;
	Line eyeR2;
	
	
	String[] updatedList = new String[0]; //Game variables
	String lettersGuessed = "Guessed Letters: ";
	int guessesRemaining = 12;
	@Override
	public void start(Stage primaryStage) throws Exception {
		try {
			GridPane root = new GridPane();
			BorderPane canvas = new BorderPane();
			Scene scene = new Scene(root,500,600);
			//scene.getStylesheets().add(getClass().getResource("application.css").toExternalForm());
			primaryStage.setScene(scene);
	
			submit = new Button("Submit"); //Submit button
			guess = new TextField(); //Guess field
			start = new Button("Start");//Start button
			size = new TextField();//Size of the word 
			guessedLetters = new Text("Guessed Letters:");//Letters that have been guessed already
			firstGuess = new TextField();//First guess of the game
			size.setText("Word Size");
			firstGuess.setText("First Guess");
			solution = new Text();
			status = new Text();
			remainingGuesses = new Text("Remaining Guesses: "+Integer.toString(guessesRemaining));
			unlimitedGuesses = new CheckBox("Unlimited Guesses");
			
			//Hangman Drawing
			root.add(canvas, 0, 6);
			Circle head= new Circle(100,100,40); head.setFill(Color.BLACK);
			Line body = new Line(100,140,100,200); body.setStrokeWidth(10);
			Line armL = new Line(100,160,60,140); armL.setStrokeWidth(10);
			Line armR = new Line(100,160,140,140); armR.setStrokeWidth(10);
			Line legL = new Line(100,200,60,240); legL.setStrokeWidth(10);
			Line legR = new Line(100,200,140,240); legR.setStrokeWidth(10);
			Circle handL = new Circle(60,140,10); head.setFill(Color.BLACK);
			Circle handR = new Circle(140,140,10); head.setFill(Color.BLACK);
			Circle footL = new Circle(60,240,10); head.setFill(Color.BLACK);
			Circle footR = new Circle(140,240,10); head.setFill(Color.BLACK);
			Line eyeR1 = new Line(115,85,125,95); eyeR1.setStroke(Color.WHITE); eyeR1.setStrokeWidth(4);
			Line eyeR2 = new Line(125,85,115,95); eyeR2.setStroke(Color.WHITE); eyeR2.setStrokeWidth(4);
			Line eyeL1 = new Line(75,85,85,95); eyeL1.setStroke(Color.WHITE); eyeL1.setStrokeWidth(4);
			Line eyeL2 = new Line(85,85,75,95); eyeL2.setStroke(Color.WHITE); eyeL2.setStrokeWidth(4);
			
			root.add(status, 0, 0);
			root.add(solution, 0, 1);
			root.add(guess, 0, 2);
			root.add(submit, 1, 2);
			root.add(size, 0, 3);
			root.add(firstGuess, 1, 3);
			root.add(start, 3, 3);
			root.add(unlimitedGuesses, 4, 3);
			root.add(guessedLetters, 0, 4);
			root.add(remainingGuesses, 0, 5);
			
			guess.setDisable(true);
			submit.setDisable(true);
	
	
			start.setOnAction(new EventHandler<ActionEvent>() {
				public void handle(ActionEvent e) {
					if (firstGuess.getText().length() == 1 && size.getText().length() == 1) {
						guess.setDisable(false);
						submit.setDisable(false);
						start.setDisable(true);
						size.setDisable(true);
						firstGuess.setDisable(true);
						unlimitedGuesses.setDisable(true);
						
						updatedList = getWordList("dictionary.txt", Integer.parseInt(size.getText()), firstGuess.getText());				
						solution.setText(getPattern(updatedList[0], firstGuess.getText()));
						guessedLetters.setText(guessedLetters.getText() + " " + firstGuess.getText() + " ");	
						status.setText("Sorry, the word doesn't have that letter in it!");
						
						size.setText("");
						firstGuess.setText("");
						guessesRemaining -= 1;	
						if(unlimitedGuesses.isSelected()) {guessesRemaining = 999;}
						if(guessesRemaining == 11) { canvas.getChildren().add(head); }
						remainingGuesses.setText("Guesses Remaining: "+Integer.toString(guessesRemaining));
					}
					else {
						status.setText("Invalid Entry. Please try again.");
					}
				}
			});
			submit.setOnAction(new EventHandler<ActionEvent>() {
				public void handle(ActionEvent e) {
					if (guessesRemaining != 1) {
						if (updatePattern(solution.getText(), updatedList[0], guess.getText()).indexOf("-") != -1) {
	
							updatedList = updateWordList(updatedList, guess.getText(), solution.getText());		
							guessedLetters.setText(guessedLetters.getText() + guess.getText() + " ");
							if (updatePattern(solution.getText(), updatedList[0], guess.getText()).equals(solution.getText())) {
								status.setText("Sorry, the word doesn't have that letter in it!");
								guessesRemaining -= 1;
								switch(guessesRemaining) {
								case 10: canvas.getChildren().add(body);
										break;
								case 9: canvas.getChildren().add(armL);
										break;
								case 8: canvas.getChildren().add(armR);
										break;	
								case 7: canvas.getChildren().add(legL);
										break;
								case 6: canvas.getChildren().add(legR);
										break;
								case 5: canvas.getChildren().add(handL);
										break;
								case 4: canvas.getChildren().add(handR);
										break;
								case 3: canvas.getChildren().add(footL);
										break;
								case 2: canvas.getChildren().add(footR);
										break;
								case 1: canvas.getChildren().addAll(eyeL1,eyeL2);
										break;
								}
								remainingGuesses.setText("Guesses Remaining: "+Integer.toString(guessesRemaining));
							}
							else {
								status.setText("Bingo! You got one!");
							}
							
							
							solution.setText(updatePattern(solution.getText(), updatedList[0], guess.getText()));
							guess.setText("");
						}
						else {
							status.setText("You win! GG!");
							solution.setText(updatePattern(solution.getText(), updatedList[0], guess.getText()));
						}
					}
					else if (updatePattern(solution.getText(), updatedList[0], guess.getText()).indexOf("-") == -1) {
						status.setText("You win! GG!");
						solution.setText(updatePattern(solution.getText(), updatedList[0], guess.getText()));
					}
					else {
						updatedList = getWordList("dictionary.txt", solution.getText().length(), firstGuess.getText());
						status.setText("You Lose! Better luck next time.");
						remainingGuesses.setText("Guesses Remaining: "+Integer.toString(guessesRemaining));
						canvas.getChildren().addAll(eyeR1,eyeR2);
					}
				}
			});
	
	
			primaryStage.show();
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	public static void main(String[] args) {
		Application.launch(args);
	}
}