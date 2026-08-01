<?php

namespace App\Services;

class MarkdownChunker
{
    public function __construct(
        private int $maxCharacters = 2000,
        private int $overlapCharacters = 200,
    ) {}

    /**
     * @return array<int, string>
     */
    public function chunk(string $markdown): array
    {
        $markdown = trim(str_replace(["\r\n", "\r"], "\n", $markdown));

        if ($markdown === '') {
            return [];
        }

        $chunks = [];
        $length = mb_strlen($markdown);
        $offset = 0;

        while ($offset < $length) {
            $remaining = $length - $offset;
            $windowLength = min($this->maxCharacters, $remaining);
            $end = $offset + $windowLength;

            if ($end < $length) {
                $window = mb_substr($markdown, $offset, $windowLength);
                $boundary = max(
                    mb_strrpos($window, "\n\n") ?: -1,
                    mb_strrpos($window, "\n") ?: -1,
                    mb_strrpos($window, ' ') ?: -1,
                );

                if ($boundary >= (int) floor($windowLength / 2)) {
                    $end = $offset + $boundary;
                }
            }

            $chunk = trim(mb_substr($markdown, $offset, $end - $offset));

            if ($chunk !== '') {
                $chunks[] = $chunk;
            }

            if ($end >= $length) {
                break;
            }

            $offset = max($offset + 1, $end - $this->overlapCharacters);
        }

        return $chunks;
    }
}
